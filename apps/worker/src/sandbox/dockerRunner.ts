import { execFile } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import crypto from 'crypto';
import { SupportedLanguage } from '@anti-oj/shared';
import { env } from '../config/env';

const execFileAsync = promisify(execFile);

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
    const { stdout } = await execFileAsync(
      'docker',
      ['ps', '-a', '--filter', 'name=oj-', '--filter', 'status=exited', '-q'],
      { windowsHide: true }
    );
    const ids = stdout.trim().split(/\s+/).filter(Boolean);
    if (ids.length > 0) {
      console.log(`[DockerReaper] Cleaning ${ids.length} exited oj- containers...`);
      await execFileAsync('docker', ['rm', '-f', ...ids], { windowsHide: true });
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

export async function sweepStaleWorkspaces(maxAgeMs = 60 * 60 * 1000): Promise<void> {
  const tmpBase = path.join(os.tmpdir(), 'anti-oj-workspaces');
  try {
    const entries = await fs.readdir(tmpBase, { withFileTypes: true });
    const now = Date.now();
    for (const entry of entries) {
      if (entry.isDirectory() && entry.name.startsWith('job-')) {
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
      console.warn('[SandboxReaper] Failed to sweep stale workspaces:', err.message);
    }
  }
}

export class DockerSandbox {
  private workspaceDir: string;
  private image: string;

  constructor(workspaceDir: string, image = env.RUNNER_IMAGE) {
    this.workspaceDir = workspaceDir;
    this.image = image;
  }

  static async create(): Promise<DockerSandbox> {
    const tmpBase = path.join(os.tmpdir(), 'anti-oj-workspaces');
    await fs.mkdir(tmpBase, { recursive: true });
    const workspaceDir = await fs.mkdtemp(path.join(tmpBase, 'job-'));
    return new DockerSandbox(workspaceDir);
  }

  async cleanup(): Promise<void> {
    try {
      await fs.rm(this.workspaceDir, { recursive: true, force: true });
    } catch (err) {
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
    const containerName = `oj-cmp-${crypto.randomUUID()}`;
    const dockerMountPath = this.normalizeDockerMountPath(this.workspaceDir);

    const args = [
      'run',
      '--name',
      containerName,
      '--rm',
      '--network',
      'none',
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
      } catch {
        // file may not exist if no errors
      }

      return {
        success: true,
        compileOutput: compileErr.trim(),
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
        compileOutput: compileErr.trim(),
        exitCode: error.code || 1,
      };
    } finally {
      activeContainers.delete(containerName);
    }
  }

  async runTestCase(
    input: string,
    language: SupportedLanguage,
    timeLimitMs = 1000,
    memoryLimitKb = 256 * 1024
  ): Promise<RunExecutionResult> {
    const containerName = `oj-run-${crypto.randomUUID()}`;
    await fs.writeFile(path.join(this.workspaceDir, 'input.txt'), input, 'utf-8');

    const dockerMountPath = this.normalizeDockerMountPath(this.workspaceDir);
    const wallTimeoutMs = Math.round(timeLimitMs * 2.5 + 2000);

    const args = [
      'run',
      '--name',
      containerName,
      '--rm',
      '--network',
      'none',
      '--memory',
      `${Math.ceil(memoryLimitKb / 1024)}m`,
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
    return {
      actualOutput,
      stderr,
      metrics,
      timedOut: timedOut || metrics.processExitStatus === 124,
    };
  }
}

