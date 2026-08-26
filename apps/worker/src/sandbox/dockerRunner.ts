import { execFile } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { SupportedLanguage } from '@anti-oj/shared';
import { env } from '../config/env';

const execFileAsync = promisify(execFile);

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

  async compile(language: SupportedLanguage, timeoutMs = 10000): Promise<CompileResult> {
    // Docker run arguments for sandboxed compilation
    // Convert Windows path to Docker volume mount format
    const dockerMountPath = this.workspaceDir.replace(/\\/g, '/');

    const args = [
      'run',
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

    try {
      await execFileAsync('docker', args, {
        timeout: timeoutMs + 5000,
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
    }
  }

  async runTestCase(
    input: string,
    language: SupportedLanguage,
    timeLimitMs = 1000,
    memoryLimitKb = 256 * 1024
  ): Promise<RunExecutionResult> {
    // Write test case input to input.txt
    await fs.writeFile(path.join(this.workspaceDir, 'input.txt'), input, 'utf-8');

    const dockerMountPath = this.workspaceDir.replace(/\\/g, '/');
    const wallTimeoutMs = Math.round(timeLimitMs * 2.5 + 2000);

    const args = [
      'run',
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
    try {
      await execFileAsync('docker', args, {
        timeout: wallTimeoutMs,
        windowsHide: true,
      });
    } catch (error: any) {
      if (error.killed || error.signal === 'SIGTERM') {
        timedOut = true;
      }
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

    const metrics = this.parseMetrics(metricsRaw);
    return {
      actualOutput,
      stderr,
      metrics,
      timedOut: timedOut || metrics.processExitStatus === 124, // 124 is standard timeout exit code
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
          result.exitCode = parseInt(val, 16) || 0; // %x is hex
          break;
        case 'PROCESS_EXIT_STATUS':
          result.processExitStatus = parseInt(val, 10) || 0;
          break;
      }
    }

    // Decision R3: CPU time drives time limit
    result.cpuTimeMs = Math.round((result.userCpuSec + result.sysCpuSec) * 1000);
    return result;
  }
}
