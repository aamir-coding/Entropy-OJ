import { describe, it } from 'node:test';
import assert from 'node:assert';
import { DockerSandbox } from './dockerRunner';
import { evaluateSubmission } from './evaluator';
import { Verdicts, SupportedLanguages } from '@anti-oj/shared';
import mongoose from 'mongoose';

describe('Docker Sandbox & Evaluator Engine Tests', () => {
  it('should compile valid C++ code successfully', async () => {
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

  it('should return Compilation Error on invalid C++ code', async () => {
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

  it('should evaluate correct C++ code to Accepted', async () => {
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

  it('should detect Wrong Answer with fail-fast', async () => {
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

  it('should evaluate Python 3 code correctly', async () => {
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

  it('should catch Time Limit Exceeded on infinite loops', async () => {
    const testCases: any[] = [
      {
        _id: new mongoose.Types.ObjectId(),
        problem: new mongoose.Types.ObjectId(),
        input: '1',
        output: '1',
        isSample: true,
        order: 1,
      },
    ];

    const loopCode = `
#include <iostream>
int main() {
    volatile long long sum = 0;
    while (true) {
        sum++;
    }
    return 0;
}
    `;

    const result = await evaluateSubmission(
      {
        submissionId: 'test-sub-4',
        problemId: 'test-prob-1',
        userId: 'test-user-1',
        code: loopCode,
        language: SupportedLanguages.CPP,
        timeLimitMs: 500,
        memoryLimitKb: 256 * 1024,
      },
      testCases
    );

    assert.strictEqual(result.verdict, Verdicts.TIME_LIMIT_EXCEEDED);
  });
});
