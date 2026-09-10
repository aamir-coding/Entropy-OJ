import { execFile } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import crypto from 'crypto';
import { SupportedLanguage } from '@entropy-oj/shared';
import { env } from '../config/env';

const execFileAsync = promisify(execFile);

export class Semaphore {
  private current = 0;
  private queue: Array<() => void> = [];

  constructor(public readonly max: number = 4) {}

  async acquire(timeoutMs = 30000): Promise<() => void> {
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

export const sandboxSemaphore = new Semaphore(4);

export const activeContainers = new Set<string>();

export async function killActiveContainers(): Promise<void> {
  if (activeContainers.size === 0) return;
  const toKill = Array.from(activeContainers);
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
}

export class DockerSandbox {
  private workspaceDir: string;
  private image: string;

  constructor(workspaceDir: string, image = env.RUNNER_IMAGE || 'oj-runner:latest') {
    this.workspaceDir = workspaceDir;
    this.image = image;
  }

  static async create(): Promise<DockerSandbox> {
    const tmpBase = path.join(os.tmpdir(), 'entropy-server-workspaces');
    await fs.mkdir(tmpBase, { recursive: true });
    const workspaceDir = await fs.mkdtemp(path.join(tmpBase, 'sample-'));
    return new DockerSandbox(workspaceDir);
  }

  async cleanup(): Promise<void> {
    try {
      await fs.rm(this.workspaceDir, { recursive: true, force: true });
    } catch (err: any) {
      if (err?.code === 'EACCES' || err?.code === 'EPERM') {
        try {
          const dockerMountPath = this.normalizeDockerMountPath(this.workspaceDir);
          await execFileAsync('docker', [
            'run', '--rm', '-v', `${dockerMountPath}:/workspace`,
            '--entrypoint', 'sh',
            this.image,
            '-c', 'rm -rf /workspace/* /workspace/.* 2>/dev/null || true',
          ], { windowsHide: true, timeout: 5000 });
          await fs.rm(this.workspaceDir, { recursive: true, force: true });
          return;
        } catch {}
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

  async compile(language: SupportedLanguage, timeoutMs = 15000): Promise<CompileResult> {
    const releaseSemaphore = await sandboxSemaphore.acquire(timeoutMs + 15000);
    const containerName = `entropy-cmp-sample-${crypto.randomUUID()}`;
    const dockerMountPath = this.normalizeDockerMountPath(this.workspaceDir);

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
      } catch {}

      return {
        success: true,
        compileOutput: compileErr.trim(),
        exitCode: 0,
      };
    } catch (error: any) {
      let compileErr = '';
      try {
        compileErr = await fs.readFile(path.join(this.workspaceDir, 'compile_err.txt'), 'utf-8');
      } catch {
        compileErr = error.stderr || error.message || 'Compilation failed';
      }

      return {
        success: false,
        compileOutput: compileErr.trim(),
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
    timeLimitMs = 2000,
    memoryLimitKb = 256 * 1024
  ): Promise<RunExecutionResult> {
    const wallTimeoutMs = Math.round(timeLimitMs * 2.5 + 2000);
    const releaseSemaphore = await sandboxSemaphore.acquire(wallTimeoutMs + 15000);
    const containerName = `entropy-run-sample-${crypto.randomUUID()}`;
    await fs.writeFile(path.join(this.workspaceDir, 'input.txt'), input, 'utf-8');

    const dockerMountPath = this.normalizeDockerMountPath(this.workspaceDir);
    const safeMemLimitMb = Math.max(32, Math.ceil(memoryLimitKb / 1024));

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
      `${safeMemLimitMb}m`,
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

    const metrics = this.parseMetrics(metricsRaw);
    return {
      actualOutput,
      stderr,
      metrics,
      timedOut: timedOut || metrics.processExitStatus === 124,
    };
  }

  private parseMetrics(raw: string): RunMetrics {
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

    result.cpuTimeMs = Math.round((result.userCpuSec + result.sysCpuSec) * 1000);
    return result;
  }
}
