import { describe, it, before } from 'node:test';
import assert from 'node:assert';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { DockerSandbox, parseMetrics } from './dockerRunner';
import { evaluateSubmission } from './evaluator';
import { Verdicts, SupportedLanguages } from '@anti-oj/shared';
import mongoose from 'mongoose';

const execFileAsync = promisify(execFile);

let isDockerAvailable = false;

describe('Docker Sandbox & Evaluator Engine Tests', () => {
  describe('parseMetrics pure unit tests (runs without Docker)', () => {
    it('should parse well-formed metrics output correctly', () => {
      const raw = [
        'WALL_SEC=0.12',
        'USER_SEC=0.08',
        'SYS_SEC=0.02',
        'MAX_RSS_KB=4500',
        'EXIT_CODE=0',
        'PROCESS_EXIT_STATUS=0',
      ].join('\n');

      const metrics = parseMetrics(raw);
      assert.strictEqual(metrics.wallTimeSec, 0.12);
      assert.strictEqual(metrics.userCpuSec, 0.08);
      assert.strictEqual(metrics.sysCpuSec, 0.02);
      assert.strictEqual(metrics.cpuTimeMs, 100);
      assert.strictEqual(metrics.maxRssKb, 4500);
      assert.strictEqual(metrics.exitCode, 0);
      assert.strictEqual(metrics.processExitStatus, 0);
    });

    it('should gracefully handle empty or malformed metrics string', () => {
      const metrics = parseMetrics('');
      assert.strictEqual(metrics.cpuTimeMs, 0);
      assert.strictEqual(metrics.maxRssKb, 0);
      assert.strictEqual(metrics.exitCode, 0);
      assert.strictEqual(metrics.processExitStatus, 0);
    });

    it('should detect non-zero exit codes and timeout process status', () => {
      const raw = [
        'WALL_SEC=2.50',
        'USER_SEC=1.00',
        'SYS_SEC=0.00',
        'MAX_RSS_KB=8192',
        'EXIT_CODE=1',
        'PROCESS_EXIT_STATUS=124',
      ].join('\n');

      const metrics = parseMetrics(raw);
      assert.strictEqual(metrics.exitCode, 1);
      assert.strictEqual(metrics.processExitStatus, 124);
      assert.strictEqual(metrics.cpuTimeMs, 1000);
    });
  });

  before(async () => {
    try {
      await execFileAsync('docker', ['info'], { windowsHide: true });
      isDockerAvailable = true;
    } catch {
      console.warn('[Test] Docker daemon not available; skipping live container tests.');
      isDockerAvailable = false;
    }
  });

  it('should compile valid C++ code successfully (if Docker present)', async (t) => {
    if (!isDockerAvailable) {
      t.skip('Docker is not running');
      return;
    }
    const sandbox = await DockerSandbox.create();
    try {
      const code = `#include <iostream>\nint main() { std::cout << "OK" << std::endl; return 0; }`;
      await sandbox.prepareSourceFile(code, SupportedLanguages.CPP);
      const res = await sandbox.compile(SupportedLanguages.CPP);
      assert.strictEqual(res.success, true);
    } finally {
      await sandbox.cleanup();
    }
  });

  it('should return Compilation Error on invalid C++ code (if Docker present)', async (t) => {
    if (!isDockerAvailable) {
      t.skip('Docker is not running');
      return;
    }
    const sandbox = await DockerSandbox.create();
    try {
      const code = `int main() { syntax_error_here; }`;
      await sandbox.prepareSourceFile(code, SupportedLanguages.CPP);
      const res = await sandbox.compile(SupportedLanguages.CPP);
      assert.strictEqual(res.success, false);
      assert.ok(res.compileOutput.length > 0);
    } finally {
      await sandbox.cleanup();
    }
  });

  it('should evaluate correct C++ code to Accepted (if Docker present)', async (t) => {
    if (!isDockerAvailable) {
      t.skip('Docker is not running');
      return;
    }
    const testCases: any[] = [
      {
        _id: new mongoose.Types.ObjectId(),
        problem: new mongoose.Types.ObjectId(),
        input: '4 9\n2 7 11 15',
        output: '0 1',
        isSample: true,
        order: 1,
      },
      {
        _id: new mongoose.Types.ObjectId(),
        problem: new mongoose.Types.ObjectId(),
        input: '3 6\n3 2 4',
        output: '1 2',
        isSample: true,
        order: 2,
      },
    ];

    const code = `
#include <iostream>
#include <vector>
#include <unordered_map>
using namespace std;

int main() {
    int n, target;
    if (!(cin >> n >> target)) return 0;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) cin >> nums[i];
    unordered_map<int, int> seen;
    for (int i = 0; i < n; i++) {
        int complement = target - nums[i];
        if (seen.count(complement)) {
            cout << seen[complement] << " " << i << "\\n";
            return 0;
        }
        seen[nums[i]] = i;
    }
    return 0;
}
    `;

    const result = await evaluateSubmission(
      {
        submissionId: 'test-sub-1',
        problemId: 'test-prob-1',
        userId: 'test-user-1',
        code,
        language: SupportedLanguages.CPP,
        timeLimitMs: 1000,
        memoryLimitKb: 256 * 1024,
      },
      testCases
    );

    assert.strictEqual(
      result.verdict,
      Verdicts.ACCEPTED,
      `Expected Accepted but got ${result.verdict}. Output: ${result.compileOutput}`
    );
    assert.strictEqual(result.passedTestCases, 2);
    assert.strictEqual(result.totalTestCases, 2);
  });

  it('should detect Wrong Answer with fail-fast (if Docker present)', async (t) => {
    if (!isDockerAvailable) {
      t.skip('Docker is not running');
      return;
    }
    const testCases: any[] = [
      {
        _id: new mongoose.Types.ObjectId(),
        problem: new mongoose.Types.ObjectId(),
        input: '4 9\n2 7 11 15',
        output: '0 1',
        isSample: true,
        order: 1,
      },
      {
        _id: new mongoose.Types.ObjectId(),
        problem: new mongoose.Types.ObjectId(),
        input: '3 6\n3 2 4',
        output: '1 2',
        isSample: true,
        order: 2,
      },
    ];

    const wrongCode = `
#include <iostream>
using namespace std;
int main() {
    cout << "0 1\\n";
    return 0;
}
    `;

    const result = await evaluateSubmission(
      {
        submissionId: 'test-sub-2',
        problemId: 'test-prob-1',
        userId: 'test-user-1',
        code: wrongCode,
        language: SupportedLanguages.CPP,
        timeLimitMs: 1000,
        memoryLimitKb: 256 * 1024,
      },
      testCases
    );

    assert.strictEqual(result.verdict, Verdicts.WRONG_ANSWER);
    assert.strictEqual(result.failedTestCaseNumber, 2);
    assert.strictEqual(result.passedTestCases, 1);
  });

  it('should evaluate Python 3 code correctly (if Docker present)', async (t) => {
    if (!isDockerAvailable) {
      t.skip('Docker is not running');
      return;
    }
    const testCases: any[] = [
      {
        _id: new mongoose.Types.ObjectId(),
        problem: new mongoose.Types.ObjectId(),
        input: '4 9\n2 7 11 15',
        output: '0 1',
        isSample: true,
        order: 1,
      },
    ];

    const pyCode = `
import sys

def solve():
    data = sys.stdin.read().split()
    if not data:
        return
    n = int(data[0])
    target = int(data[1])
    nums = [int(x) for x in data[2:2+n]]
    seen = {}
    for i, x in enumerate(nums):
        comp = target - x
        if comp in seen:
            print(f"{seen[comp]} {i}")
            return
        seen[x] = i

if __name__ == '__main__':
    solve()
    `;

    const result = await evaluateSubmission(
      {
        submissionId: 'test-sub-3',
        problemId: 'test-prob-1',
        userId: 'test-user-1',
        code: pyCode,
        language: SupportedLanguages.PYTHON,
        timeLimitMs: 1000,
        memoryLimitKb: 256 * 1024,
      },
      testCases
    );

    assert.strictEqual(result.verdict, Verdicts.ACCEPTED);
    assert.strictEqual(result.passedTestCases, 1);
  });
});
