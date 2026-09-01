process.env.NODE_ENV = 'test';
import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import http from 'http';
import { createApp } from '../app';
import { connectDB, disconnectDB } from '../config/db';
import { User } from '../models/User';
import { Problem } from '../models/Problem';
import { Solution } from '../models/Solution';
import { redisClient } from '../config/redis';

let server: http.Server;
let port: number;
let baseUrl: string;
let authCookie = '';
let testUserId = '';
let createdSubmissionId = '';
let isServicesAvailable = false;

async function postJson(path: string, body: any, headers: Record<string, string> = {}) {
  const res = await fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return { status: res.status, data, headers: res.headers };
}

async function getJson(path: string, headers: Record<string, string> = {}) {
  const res = await fetch(`${baseUrl}${path}`, {
    method: 'GET',
    headers,
  });
  const data = await res.json();
  return { status: res.status, data, headers: res.headers };
}

describe('Server REST API Integration Tests', () => {
  before(async () => {
    try {
      await connectDB();
      await redisClient.ping();
      isServicesAvailable = true;
    } catch {
      console.warn('[Test] MongoDB or Redis not reachable in test environment; testing HTTP routing and health.');
      isServicesAvailable = false;
      try {
        redisClient.disconnect();
      } catch {}
    }

    const app = createApp();
    await new Promise<void>((resolve) => {
      server = app.listen(0, () => {
        const addr = server.address() as any;
        port = addr.port;
        baseUrl = `http://localhost:${port}`;
        resolve();
      });
    });
  });

  after(async () => {
    if (server) server.close();
    if (isServicesAvailable) {
      const { submissionQueue } = await import('../queues/submission.queue');
      await submissionQueue.close();
      await disconnectDB();
      try {
        await redisClient.quit();
      } catch {}
    } else {
      try {
        redisClient.disconnect();
      } catch {}
    }
  });

  it('GET /health should return 200 OK without database requirement', async () => {
    const res = await getJson('/health');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.status, 'healthy');
  });

  it('POST /api/auth/register should register a user and set JWT cookie (if DB available)', async (t) => {
    if (!isServicesAvailable) {
      t.skip('MongoDB/Redis unavailable');
      return;
    }

    const email = `testuser_${Date.now()}@example.com`;
    const res = await postJson('/api/auth/register', {
      fullName: 'Test Developer',
      email,
      password: 'password123A',
    });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.data.user.email, email);

    testUserId = res.data.data.user._id;
    const cookieHeader = res.headers.get('set-cookie');
    assert.ok(cookieHeader && cookieHeader.includes('token='));
    authCookie = cookieHeader.split(';')[0];
  });

  it('POST /api/auth/register should reject duplicate email (if DB available)', async (t) => {
    if (!isServicesAvailable) {
      t.skip('MongoDB/Redis unavailable');
      return;
    }

    const user = await User.findById(testUserId);
    assert.ok(user);

    const res = await postJson('/api/auth/register', {
      fullName: 'Another User',
      email: user.email,
      password: 'password123A',
    });

    assert.strictEqual(res.status, 409);
    assert.strictEqual(res.data.success, false);
  });

  it('POST /api/auth/login should authenticate and return 200 (if DB available)', async (t) => {
    if (!isServicesAvailable) {
      t.skip('MongoDB/Redis unavailable');
      return;
    }

    const user = await User.findById(testUserId);
    assert.ok(user);

    const res = await postJson('/api/auth/login', {
      email: user.email,
      password: 'password123A',
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
  });

  it('GET /api/auth/me should return user details with auth cookie (if DB available)', async (t) => {
    if (!isServicesAvailable) {
      t.skip('MongoDB/Redis unavailable');
      return;
    }

    const res = await getJson('/api/auth/me', {
      Cookie: authCookie,
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.data.user._id, testUserId);
    assert.ok(res.data.data.stats !== undefined);
  });

  it('GET /api/problems should list problems (if DB available)', async (t) => {
    if (!isServicesAvailable) {
      t.skip('MongoDB/Redis unavailable');
      return;
    }

    const res = await getJson('/api/problems');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.ok(Array.isArray(res.data.data.problems));
  });

  it('POST /api/submissions/run should execute code against sample test cases (if DB available)', async (t) => {
    if (!isServicesAvailable) {
      t.skip('MongoDB/Redis unavailable');
      return;
    }

    let problem = await Problem.findOne({ problemCode: 'two-sum' });
    if (!problem) {
      problem = await Problem.create({
        problemCode: 'two-sum',
        name: 'Two Sum',
        statement: 'Sample statement',
        difficulty: 'Easy',
        sampleCases: [{ input: '4 9\n2 7 11 15', output: '0 1' }],
      });
    }

    const res = await postJson(
      '/api/submissions/run',
      {
        problemId: problem._id.toString(),
        language: 'cpp',
        code: `#include <iostream>\nusing namespace std;\nint main() { cout << "0 1\\n"; return 0; }`,
      },
      {
        Cookie: authCookie,
      }
    );

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.ok(Array.isArray(res.data.data.sampleResults));
    assert.strictEqual(res.data.data.totalCases, problem.sampleCases.length);
    assert.strictEqual(res.data.data.sampleResults.length, problem.sampleCases.length);
  });

  it('POST /api/submissions/run should return real actual output and Wrong Answer on incorrect code (if DB available)', async (t) => {
    if (!isServicesAvailable) {
      t.skip('MongoDB/Redis unavailable');
      return;
    }

    const problem = await Problem.findOne({ problemCode: 'two-sum' });
    assert.ok(problem);

    const res = await postJson(
      '/api/submissions/run',
      {
        problemId: problem._id.toString(),
        language: 'python',
        code: `print("Hello World")`,
      },
      {
        Cookie: authCookie,
      }
    );

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.data.verdict, 'Wrong Answer');
    assert.strictEqual(res.data.data.passedCases, 0);
    assert.strictEqual(res.data.data.sampleResults[0].actualOutput.trim(), 'Hello World');
    assert.strictEqual(res.data.data.sampleResults[0].passed, false);
  });

  it('GET /api/submissions/problem/:problemId should return submissions with code and metadata', async (t) => {
    if (!isServicesAvailable) {
      t.skip('MongoDB/Redis unavailable');
      return;
    }

    const problem = await Problem.findOne({ problemCode: 'two-sum' });
    assert.ok(problem);

    const testCode = '#include <iostream>\nint main() { return 0; }';
    const sub = await Solution.create({
      user: testUserId,
      problem: problem._id,
      code: testCode,
      language: 'cpp',
      verdict: 'Accepted',
      executionTime: 12,
      memoryUsed: 1024,
      passedTestCases: 5,
      totalTestCases: 5,
      submittedAt: new Date(),
    });

    const res = await getJson(`/api/submissions/problem/${problem._id}`, {
      Cookie: authCookie,
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.ok(Array.isArray(res.data.data));
    const found = res.data.data.find((item: any) => item._id === sub._id.toString());
    assert.ok(found, 'Created submission should be found in problem submissions');
    assert.strictEqual(found.code, testCode, 'Submission code should be included in problem submissions');
    assert.strictEqual(found.language, 'cpp');
    assert.strictEqual(found.verdict, 'Accepted');
  });

  it('GET /api/submissions/user/:userId should return submissions with code and classification', async (t) => {
    if (!isServicesAvailable) {
      t.skip('MongoDB/Redis unavailable');
      return;
    }

    const res = await getJson(`/api/submissions/user/${testUserId}`, {
      Cookie: authCookie,
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.ok(Array.isArray(res.data.data.submissions));
    const sub = res.data.data.submissions.find((s: any) => s.code === '#include <iostream>\nint main() { return 0; }');
    assert.ok(sub, 'User submission with code should be found');
  });

  it('GET /api/admin/problems should reject non-admin users with 403 Forbidden', async (t) => {
    if (!isServicesAvailable) {
      t.skip('MongoDB/Redis unavailable');
      return;
    }

    // regular user authCookie
    const res = await getJson('/api/admin/problems', { Cookie: authCookie });
    assert.strictEqual(res.status, 403);
    assert.strictEqual(res.data.success, false);
    assert.match(res.data.error, /Administrator privileges required/);
  });

  it('Admin endpoints should allow full problem lifecycle for admin users', async (t) => {
    if (!isServicesAvailable) {
      t.skip('MongoDB/Redis unavailable');
      return;
    }

    // Create an admin user & get admin cookie
    const adminEmail = `admin-${Date.now()}@anti-oj.com`;
    const adminUser = await User.create({
      fullName: 'Test Admin',
      email: adminEmail,
      password: 'AdminPassword123!',
      role: 'admin',
    });

    const loginRes = await postJson('/api/auth/login', {
      email: adminEmail,
      password: 'AdminPassword123!',
    });
    assert.strictEqual(loginRes.status, 200);
    const setCookie = loginRes.headers.get('set-cookie');
    assert.ok(setCookie);
    const adminCookie = setCookie.split(';')[0];

    // 1. GET /api/admin/problems
    const listRes = await getJson('/api/admin/problems', { Cookie: adminCookie });
    assert.strictEqual(listRes.status, 200);
    assert.strictEqual(listRes.data.success, true);
    assert.ok(Array.isArray(listRes.data.data));

    // 2. POST /api/admin/problems (Create a new problem with sample & hidden test cases)
    const newProblemSlug = `test-admin-prob-${Date.now()}`;
    const createRes = await postJson(
      '/api/admin/problems',
      {
        problemCode: newProblemSlug,
        name: 'Test Admin Problem',
        statement: '### Description\nSolve $A + B$',
        difficulty: 'Easy',
        tags: ['Math'],
        timeLimitMs: 1000,
        memoryLimitKb: 256 * 1024,
        sampleCases: [{ input: '2 3', output: '5', explanation: '2+3=5' }],
        testCases: [
          { input: '2 3', output: '5', isSample: true },
          { input: '10 20', output: '30', isSample: false },
        ],
      },
      { Cookie: adminCookie }
    );
    assert.strictEqual(createRes.status, 201);
    assert.strictEqual(createRes.data.success, true);

    // 3. GET /api/admin/problems/:id (Retrieve problem including hidden testcases)
    const detailRes = await getJson(`/api/admin/problems/${newProblemSlug}`, { Cookie: adminCookie });
    assert.strictEqual(detailRes.status, 200);
    assert.strictEqual(detailRes.data.data.problemCode, newProblemSlug);
    assert.strictEqual(detailRes.data.data.testCases.length, 2);

    // 4. POST /api/admin/problems/:id/validate (Run model solution against all test cases in sandbox)
    const valRes = await postJson(
      `/api/admin/problems/${newProblemSlug}/validate`,
      {
        language: 'python',
        code: `import sys\na, b = map(int, sys.stdin.read().split())\nprint(a + b)`,
      },
      { Cookie: adminCookie }
    );
    assert.strictEqual(valRes.status, 200);
    assert.strictEqual(valRes.data.success, true);
    assert.strictEqual(valRes.data.data.verdict, 'Accepted');
    assert.strictEqual(valRes.data.data.passedTestCases, 2);

    // 5. DELETE /api/admin/problems/:id (Delete problem and cascade)
    const deleteRes = await fetch(`${baseUrl}/api/admin/problems/${newProblemSlug}`, {
      method: 'DELETE',
      headers: { Cookie: adminCookie },
    });
    const deleteData = await deleteRes.json();
    assert.strictEqual(deleteRes.status, 200);
    assert.strictEqual(deleteData.success, true);

    // Verify deleted
    const verifyDeleted = await Problem.findOne({ problemCode: newProblemSlug });
    assert.strictEqual(verifyDeleted, null);
  });
});
