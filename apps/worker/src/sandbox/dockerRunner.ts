import { execFile } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import crypto from 'crypto';
import { SupportedLanguage } from '@anti-oj/shared';
import { env } from '../config/env';

const execFileAsync = promisify(execFile);

export class Semaphore {
  private current = 0;
  private queue: Array<() => void> = [];

  constructor(public readonly max: number = env.WORKER_CONCURRENCY || 4) {}

  async acquire(timeoutMs = 60000): Promise<() => void> {
    if (this.current < this.max) {
      this.current++;
      let released = false;
      return () => {
        if (!released) {
          released = true;
          this.release();
        }
      };
    }

    return new Promise<() => void>((resolve, reject) => {
      let timer: NodeJS.Timeout | null = null;
      let released = false;

      const onAcquire = () => {
        if (timer) clearTimeout(timer);
        resolve(() => {
          if (!released) {
            released = true;
            this.release();
          }
        });
      };

      if (timeoutMs > 0) {
        timer = setTimeout(() => {
          const idx = this.queue.indexOf(onAcquire);
          if (idx !== -1) {
            this.queue.splice(idx, 1);
            reject(new Error('Timed out waiting for Docker sandbox execution slot'));
          }
        }, timeoutMs);
      }

      this.queue.push(onAcquire);
    });
  }

  private release(): void {
    if (this.queue.length > 0) {
      const next = this.queue.shift();
      if (next) next();
    } else {
      this.current = Math.max(0, this.current - 1);
    }
  }

  get activeCount(): number {
    return this.current;
  }

  get queueLength(): number {
    return this.queue.length;
  }
}

export const containerSemaphore = new Semaphore(env.WORKER_CONCURRENCY || 4);

export const activeContainers = new Set<string>();

export interface CompileResult {
  success: boolean;
  compileOutput: string;
  exitCode: number;
}

export interface RunMetrics {
  wallTimeSec: number;
  userCpuSec: number;
  sysCpuSec: number;
  cpuTimeMs: number;
  maxRssKb: number;
  exitCode: number;
  processExitStatus: number;
}

export interface RunExecutionResult {
  actualOutput: string;
  stderr: string;
  metrics: RunMetrics;
  timedOut: boolean;
  isOomKilled: boolean;
}

export function parseMetrics(raw: string): RunMetrics {
  const result: RunMetrics = {
    wallTimeSec: 0,
    userCpuSec: 0,
    sysCpuSec: 0,
    cpuTimeMs: 0,
    maxRssKb: 0,
    exitCode: 0,
    processExitStatus: 0,
  };

  if (!raw) return result;

  const lines = raw.split('\n');
  for (const line of lines) {
    const [key, val] = line.trim().split('=');
    if (!key || val === undefined) continue;

    switch (key) {
      case 'WALL_SEC':
        result.wallTimeSec = parseFloat(val) || 0;
        break;
      case 'USER_SEC':
        result.userCpuSec = parseFloat(val) || 0;
        break;
      case 'SYS_SEC':
        result.sysCpuSec = parseFloat(val) || 0;
        break;
      case 'MAX_RSS_KB':
        result.maxRssKb = parseInt(val, 10) || 0;
        break;
      case 'EXIT_CODE':
        result.exitCode = parseInt(val, 10) || 0;
        break;
      case 'PROCESS_EXIT_STATUS':
        result.processExitStatus = parseInt(val, 10) || 0;
        break;
    }
  }

  // CPU time drives time limit calculation
  result.cpuTimeMs = Math.round((result.userCpuSec + result.sysCpuSec) * 1000);
  return result;
}

export async function reapOrphanedContainers(): Promise<void> {
  try {
    const { stdout: allStdout } = await execFileAsync(
      'docker',
      ['ps', '-a', '--format', '{{.ID}}\t{{.Names}}\t{{.Status}}\t{{.RunningFor}}'],
      { windowsHide: true }
    );

    if (!allStdout) return;

    const targetIds: string[] = [];

    for (const line of allStdout.trim().split('\n')) {
      const [id, name, status, runningFor] = line.split('\t');
      if (!id || !name) continue;

      const lowerName = name.toLowerCase();

      // STRICT SAFETY: Never touch infrastructure, database, queue, or proxy containers
      if (
        lowerName.includes('mongo') ||
        lowerName.includes('redis') ||
        lowerName.includes('server') ||
        lowerName.includes('worker') ||
        lowerName.includes('client')
      ) {
        continue;
      }

      // Only reap sandbox evaluation containers
      const isSandboxContainer =
        lowerName.startsWith('entropy-run-') ||
        lowerName.startsWith('entropy-cmp-') ||
        lowerName.startsWith('oj-run-') ||
        lowerName.startsWith('oj-cmp-');

      if (!isSandboxContainer) continue;

      const isExited = status?.toLowerCase().includes('exited');
      const isStale =
        runningFor &&
        (runningFor.includes('hour') ||
          runningFor.includes('day') ||
          runningFor.includes('week') ||
          (runningFor.includes('minute') && parseInt(runningFor, 10) >= 5));

      if (isExited || isStale) {
        targetIds.push(id.trim());
      }
    }

    if (targetIds.length > 0) {
      console.log(`[DockerReaper] Safely cleaning ${targetIds.length} exited or stale sandbox containers...`);
      for (let i = 0; i < targetIds.length; i += 50) {
        const batch = targetIds.slice(i, i + 50);
        try {
          await execFileAsync('docker', ['rm', '-f', ...batch], { windowsHide: true });
        } catch {}
      }
    }
  } catch (err: any) {
    if (env.NODE_ENV !== 'test') {
      console.warn('[DockerReaper] Container reap skipped or failed:', err.message);
    }
  }
}

export async function killActiveContainers(): Promise<void> {
  if (activeContainers.size === 0) return;
  const toKill = Array.from(activeContainers);
  console.log(`[DockerReaper] Terminating ${toKill.length} active containers...`);
  await Promise.allSettled(
    toKill.map(async (name) => {
      try {
        await execFileAsync('docker', ['kill', name], { windowsHide: true });
        await execFileAsync('docker', ['rm', '-f', name], { windowsHide: true });
      } catch {} finally {
        activeContainers.delete(name);
      }
    })
  );
}

export const BASE_WORKSPACES_DIR = env.WORKSPACES_DIR || path.join(os.tmpdir(), 'entropy-workspaces');
export const LEGACY_WORKSPACES_DIR = path.join(os.tmpdir(), 'anti-oj-workspaces');

export async function sweepStaleWorkspaces(maxAgeMs = 60 * 60 * 1000): Promise<void> {
  const dirsToSweep = [BASE_WORKSPACES_DIR, LEGACY_WORKSPACES_DIR];

  for (const tmpBase of dirsToSweep) {
    try {
      const entries = await fs.readdir(tmpBase, { withFileTypes: true });
      const now = Date.now();
      for (const entry of entries) {
        if (entry.isDirectory() && (entry.name.startsWith('job-') || entry.name.startsWith('sample-'))) {
          const fullPath = path.join(tmpBase, entry.name);
          try {
            const stats = await fs.stat(fullPath);
            if (now - stats.mtimeMs > maxAgeMs) {
              await fs.rm(fullPath, { recursive: true, force: true });
              console.log(`[SandboxReaper] Purged stale workspace: ${entry.name}`);
            }
          } catch {}
        }
      }
    } catch (err: any) {
      if (err.code !== 'ENOENT' && env.NODE_ENV !== 'test') {
        console.warn(`[SandboxReaper] Failed to sweep directory ${tmpBase}:`, err.message);
      }
    }
  }
}

export class DockerSandbox {
  private workspaceDir: string;
  private hostMountPath: string;
  private image: string;

  constructor(workspaceDir: string, hostMountPath?: string, image = env.RUNNER_IMAGE) {
    this.workspaceDir = workspaceDir;
    this.hostMountPath = hostMountPath || workspaceDir;
    this.image = image;
  }

  static async create(): Promise<DockerSandbox> {
    const tmpBase = BASE_WORKSPACES_DIR;
    await fs.mkdir(tmpBase, { recursive: true });
    const workspaceDir = await fs.mkdtemp(path.join(tmpBase, 'job-'));
    const folderName = path.basename(workspaceDir);
    const hostMountPath = env.HOST_WORKSPACES_DIR
      ? path.join(env.HOST_WORKSPACES_DIR, folderName)
      : workspaceDir;
    return new DockerSandbox(workspaceDir, hostMountPath);
  }

  async cleanup(): Promise<void> {
    try {
      await fs.rm(this.workspaceDir, { recursive: true, force: true });
    } catch (err: any) {
      // Medium 2: If Linux root-owned files in volume mount cause EACCES/EPERM,
      // wipe contents via an ephemeral container before removing directory
      if (err?.code === 'EACCES' || err?.code === 'EPERM') {
        try {
          const dockerMountPath = this.normalizeDockerMountPath(this.hostMountPath);
          await execFileAsync('docker', [
            'run', '--rm', '-v', `${dockerMountPath}:/workspace`,
            '--entrypoint', 'sh',
            this.image,
            '-c', 'rm -rf /workspace/* /workspace/.* 2>/dev/null || true',
          ], { windowsHide: true, timeout: 5000 });
          await fs.rm(this.workspaceDir, { recursive: true, force: true });
          return;
        } catch (fallbackErr: any) {
          console.error(`[Sandbox] Container cleanup fallback failed for ${this.workspaceDir}:`, fallbackErr.message);
        }
      }
      console.error(`[Sandbox] Failed to clean workspace ${this.workspaceDir}:`, err);
    }
  }

  async prepareSourceFile(code: string, language: SupportedLanguage): Promise<void> {
    const filename = language === 'cpp' ? 'solution.cpp' : 'solution.py';
    await fs.writeFile(path.join(this.workspaceDir, filename), code, 'utf-8');
  }

  private normalizeDockerMountPath(dirPath: string): string {
    const normalized = dirPath.replace(/\\/g, '/');
    return normalized;
  }

  async compile(
    language: SupportedLanguage,
    timeoutMs = (env.DOCKER_TIMEOUT_SEC || 15) * 1000
  ): Promise<CompileResult> {
    const releaseSemaphore = await containerSemaphore.acquire(timeoutMs + 15000);
    const containerName = `entropy-cmp-${crypto.randomUUID()}`;
    const dockerMountPath = this.normalizeDockerMountPath(this.hostMountPath);

    const args = [
      'run',
      '--name',
      containerName,
      '--rm',
      '--read-only',
      '--tmpfs',
      '/tmp:rw,noexec,nosuid,size=64m',
      '--network',
      'none',
      '--cap-drop=ALL',
      '--security-opt=no-new-privileges:true',
      '--memory',
      '512m',
      '--memory-swap',
      '512m',
      '--cpus',
      '1.0',
      '--pids-limit',
      '128',
      '-v',
      `${dockerMountPath}:/workspace`,
      this.image,
      'compile',
      language,
      timeoutMs.toString(),
    ];

    activeContainers.add(containerName);

    try {
      await execFileAsync('docker', args, {
        timeout: timeoutMs + 10000,
        windowsHide: true,
      });

      let compileErr = '';
      try {
        compileErr = await fs.readFile(path.join(this.workspaceDir, 'compile_err.txt'), 'utf-8');
      } catch {
        // file may not exist if no errors
      }

      return {
        success: true,
        compileOutput: compileErr.slice(0, 65536).trim(),
        exitCode: 0,
      };
    } catch (error: any) {
      // Ensure container is killed if timed out or failed
      try {
        await execFileAsync('docker', ['kill', containerName], { windowsHide: true });
      } catch {}
      try {
        await execFileAsync('docker', ['rm', '-f', containerName], { windowsHide: true });
      } catch {}

      let compileErr = '';
      try {
        compileErr = await fs.readFile(path.join(this.workspaceDir, 'compile_err.txt'), 'utf-8');
      } catch {
        compileErr = error.stderr || error.message || 'Compilation failed';
      }

      return {
        success: false,
        compileOutput: compileErr.slice(0, 65536).trim(),
        exitCode: error.code || 1,
      };
    } finally {
      activeContainers.delete(containerName);
      releaseSemaphore();
    }
  }

  async runTestCase(
    input: string,
    language: SupportedLanguage,
    timeLimitMs = 1000,
    memoryLimitKb = 256 * 1024
  ): Promise<RunExecutionResult> {
    const wallTimeoutMs = Math.round(timeLimitMs * 2.5 + 2000);
    const releaseSemaphore = await containerSemaphore.acquire(wallTimeoutMs + 10000);
    const containerName = `entropy-run-${crypto.randomUUID()}`;
    await fs.writeFile(path.join(this.workspaceDir, 'input.txt'), input, 'utf-8');

    const dockerMountPath = this.normalizeDockerMountPath(this.hostMountPath);
    // Low 2: Clamp container memory limits to a safe minimum execution floor (32MB)
    const safeMemLimitMb = Math.max(32, Math.ceil(memoryLimitKb / 1024));
    const memLimit = `${safeMemLimitMb}m`;

    const args = [
      'run',
      '--name',
      containerName,
      '--rm',
      '--read-only',
      '--tmpfs',
      '/tmp:rw,noexec,nosuid,size=32m',
      '--network',
      'none',
      '--cap-drop=ALL',
      '--security-opt=no-new-privileges:true',
      '--memory',
      memLimit,
      '--memory-swap',
      memLimit,
      '--cpus',
      '0.5',
      '--pids-limit',
      '64',
      '-v',
      `${dockerMountPath}:/workspace`,
      this.image,
      'run',
      language,
      timeLimitMs.toString(),
    ];

    let timedOut = false;
    let isOomKilled = false;
    activeContainers.add(containerName);

    try {
      await execFileAsync('docker', args, {
        timeout: wallTimeoutMs,
        windowsHide: true,
      });
    } catch (error: any) {
      if (error.killed || error.signal === 'SIGTERM') {
        timedOut = true;
      }
      if (error.code === 137 || error.status === 137 || error.signal === 'SIGKILL') {
        isOomKilled = true;
      }
      try {
        await execFileAsync('docker', ['kill', containerName], { windowsHide: true });
      } catch {}
      try {
        await execFileAsync('docker', ['rm', '-f', containerName], { windowsHide: true });
      } catch {}
    } finally {
      activeContainers.delete(containerName);
      releaseSemaphore();
    }

    // Read outputs
    let actualOutput = '';
    let stderr = '';
    let metricsRaw = '';

    try {
      actualOutput = await fs.readFile(path.join(this.workspaceDir, 'output.txt'), 'utf-8');
    } catch {}

    try {
      stderr = await fs.readFile(path.join(this.workspaceDir, 'stderr.txt'), 'utf-8');
    } catch {}

    try {
      metricsRaw = await fs.readFile(path.join(this.workspaceDir, 'metrics.txt'), 'utf-8');
    } catch {}

    const metrics = parseMetrics(metricsRaw);
    if (metrics.exitCode === 137 || metrics.processExitStatus === 137) {
      isOomKilled = true;
    }

    return {
      actualOutput,
      stderr: stderr.slice(0, 16384),
      metrics,
      timedOut: timedOut || metrics.processExitStatus === 124,
      isOomKilled,
    };
  }
}

