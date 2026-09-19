import { execFile } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import os from 'os';
import { SupportedLanguage } from '@entropy-oj/shared';
import { env } from '../config/env';

const execFileAsync = promisify(execFile);

// ─── Concurrency Semaphore ─────────────────────────────────────────────────────
// Limits the number of concurrent child processes to prevent overloading the host.
// No Docker container tracking needed — the semaphore purely caps concurrent executions.

export class Semaphore {
  private current = 0;
  private queue: Array<() => void> = [];

  constructor(public readonly max: number = env.WORKER_CONCURRENCY || 2) {}

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
            reject(new Error('Timed out waiting for execution slot'));
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

export const processSemaphore = new Semaphore(env.WORKER_CONCURRENCY || 2);

// Track active child process PIDs for graceful shutdown
export const activeProcesses = new Set<number>();

// ─── Shared Types (unchanged from Docker-based runner) ─────────────────────────

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

// ─── Metrics Parser (identical to Docker version) ──────────────────────────────

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

// ─── Workspace Cleanup ─────────────────────────────────────────────────────────

export const BASE_WORKSPACES_DIR = env.WORKSPACES_DIR || path.join(os.tmpdir(), 'entropy-workspaces');

export async function sweepStaleWorkspaces(maxAgeMs = 60 * 60 * 1000): Promise<void> {
  try {
    const entries = await fs.readdir(BASE_WORKSPACES_DIR, { withFileTypes: true });
    const now = Date.now();
    for (const entry of entries) {
      if (entry.isDirectory() && (entry.name.startsWith('job-') || entry.name.startsWith('sample-'))) {
        const fullPath = path.join(BASE_WORKSPACES_DIR, entry.name);
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
      console.warn(`[SandboxReaper] Failed to sweep workspaces:`, err.message);
    }
  }
}

/**
 * Kill any lingering child processes during shutdown.
 * Since we track PIDs, we can signal them directly — no Docker daemon needed.
 */
export async function killActiveProcesses(): Promise<void> {
  if (activeProcesses.size === 0) return;
  const toKill = Array.from(activeProcesses);
  console.log(`[Shutdown] Terminating ${toKill.length} active child processes...`);
  for (const pid of toKill) {
    try {
      process.kill(pid, 'SIGKILL');
    } catch {}
    activeProcesses.delete(pid);
  }
}

// ─── Process Sandbox ───────────────────────────────────────────────────────────
export class ProcessSandbox {
  private workspaceDir: string;
  private runnerScript: string;

  constructor(workspaceDir: string) {
    this.workspaceDir = workspaceDir;
    const configuredScript = env.RUNNER_SCRIPT_PATH || '/usr/local/bin/runner_process.sh';
    const fallbackScript = path.resolve(__dirname, '../../docker/runner_process.sh');
    if (!fsSync.existsSync(configuredScript) && fsSync.existsSync(fallbackScript)) {
      this.runnerScript = fallbackScript;
    } else {
      this.runnerScript = configuredScript;
    }
  }

  static async create(): Promise<ProcessSandbox> {
    const tmpBase = BASE_WORKSPACES_DIR;
    await fs.mkdir(tmpBase, { recursive: true });
    await fs.chmod(tmpBase, 0o777).catch(() => {});
    const workspaceDir = await fs.mkdtemp(path.join(tmpBase, 'job-'));
    await fs.chmod(workspaceDir, 0o777).catch(() => {});
    return new ProcessSandbox(workspaceDir);
  }

  async cleanup(): Promise<void> {
    try {
      await fs.rm(this.workspaceDir, { recursive: true, force: true });
    } catch (err: any) {
      console.error(`[Sandbox] Failed to clean workspace ${this.workspaceDir}:`, err);
    }
  }

  async prepareSourceFile(code: string, language: SupportedLanguage): Promise<void> {
    const filename = language === 'cpp' ? 'solution.cpp' : 'solution.py';
    const filePath = path.join(this.workspaceDir, filename);
    await fs.writeFile(filePath, code, 'utf-8');
    await fs.chmod(filePath, 0o666).catch(() => {});
  }

  async compile(
    language: SupportedLanguage,
    timeoutMs = (env.DOCKER_TIMEOUT_SEC || 15) * 1000
  ): Promise<CompileResult> {
    const releaseSemaphore = await processSemaphore.acquire(timeoutMs + 15000);

    try {
      const args = [this.runnerScript, 'compile', language, timeoutMs.toString()];

      try {
        const proc = execFile('bash', args, {
          timeout: timeoutMs + 10000,
          cwd: this.workspaceDir,
          env: { ...process.env, HOME: this.workspaceDir },
          windowsHide: true,
        });

        // Track the child process PID for graceful shutdown
        if (proc.pid) activeProcesses.add(proc.pid);

        await new Promise<void>((resolve, reject) => {
          proc.on('close', () => resolve());
          proc.on('error', reject);
        });

        if (proc.pid) activeProcesses.delete(proc.pid);

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
        if (error.pid) activeProcesses.delete(error.pid);

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
      }
    } finally {
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
    const releaseSemaphore = await processSemaphore.acquire(wallTimeoutMs + 10000);

    let timedOut = false;
    let isOomKilled = false;

    try {
      const inputPath = path.join(this.workspaceDir, 'input.txt');
      await fs.writeFile(inputPath, input, 'utf-8');
      await fs.chmod(inputPath, 0o666).catch(() => {});

      const args = [this.runnerScript, 'run', language, timeLimitMs.toString()];

      try {
        const proc = execFile('bash', args, {
          timeout: wallTimeoutMs,
          cwd: this.workspaceDir,
          env: { ...process.env, HOME: this.workspaceDir },
          windowsHide: true,
        });

        if (proc.pid) activeProcesses.add(proc.pid);

        await new Promise<void>((resolve, reject) => {
          proc.on('close', () => resolve());
          proc.on('error', reject);
        });

        if (proc.pid) activeProcesses.delete(proc.pid);
      } catch (error: any) {
        if (error.pid) activeProcesses.delete(error.pid);

        if (error.killed || error.signal === 'SIGTERM') {
          timedOut = true;
        }
        if (error.code === 137 || error.status === 137 || error.signal === 'SIGKILL') {
          isOomKilled = true;
        }
      }
    } finally {
      releaseSemaphore();
    }

    // Read outputs (same file locations as Docker-based runner)
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
