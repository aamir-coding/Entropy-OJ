process.env.NODE_ENV = 'test';
import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import http from 'http';
import { createApp } from '../app';
import { connectDB, disconnectDB } from '../config/db';
import { User } from '../models/User';
import { Problem } from '../models/Problem';
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
});
