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
    await connectDB();
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
    const { submissionQueue } = await import('../queues/submission.queue');
    await submissionQueue.close();
    await disconnectDB();
    redisClient.disconnect();
  });

  it('GET /health should return 200 OK', async () => {
    const res = await getJson('/health');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.status, 'healthy');
  });

  it('POST /api/auth/register should register a user and set JWT cookie', async () => {
    const email = `testuser_${Date.now()}@example.com`;
    const res = await postJson('/api/auth/register', {
      fullName: 'Test Developer',
      email,
      password: 'password123',
    });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.data.user.email, email);

    testUserId = res.data.data.user._id;
    const cookieHeader = res.headers.get('set-cookie');
    assert.ok(cookieHeader && cookieHeader.includes('token='));
    authCookie = cookieHeader.split(';')[0];
  });

  it('POST /api/auth/register should reject duplicate email (Decision)', async () => {
    const user = await User.findOne({});
    assert.ok(user);

    const res = await postJson('/api/auth/register', {
      fullName: 'Another User',
      email: user.email,
      password: 'password123',
    });

    assert.strictEqual(res.status, 409);
    assert.strictEqual(res.data.success, false);
  });

  it('POST /api/auth/login should authenticate and return 200', async () => {
    const user = await User.findById(testUserId);
    assert.ok(user);

    const res = await postJson('/api/auth/login', {
      email: user.email,
      password: 'password123',
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
  });

  it('GET /api/auth/me should return user details with auth cookie', async () => {
    const res = await getJson('/api/auth/me', {
      Cookie: authCookie,
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.data.user._id, testUserId);
    assert.ok(res.data.data.stats !== undefined);
  });

  it('GET /api/problems should list problems without leaking hidden test cases', async () => {
    const res = await getJson('/api/problems');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.ok(Array.isArray(res.data.data.problems));
    assert.ok(res.data.data.problems.length > 0);

    // Verify fields
    const first = res.data.data.problems[0];
    assert.ok(first.problemCode);
    assert.ok(first.difficulty);
    assert.strictEqual((first as any).testCases, undefined);
  });

  it('GET /api/problems/two-sum should return problem details and sampleCases only', async () => {
    const res = await getJson('/api/problems/two-sum');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.data.problemCode, 'two-sum');
    assert.ok(Array.isArray(res.data.data.sampleCases));
    assert.ok(res.data.data.sampleCases.length > 0);
    assert.strictEqual((res.data.data as any).hiddenTestCases, undefined);
  });

  it('POST /api/submissions should accept submission in Pending state and enqueue', async () => {
    const problem = await Problem.findOne({ problemCode: 'two-sum' });
    assert.ok(problem);

    const code = `
#include <iostream>
using namespace std;
int main() {
    cout << "0 1\\n";
    return 0;
}
    `;

    const res = await postJson(
      '/api/submissions',
      {
        problemId: problem._id.toString(),
        language: 'cpp',
        code,
      },
      {
        Cookie: authCookie,
      }
    );

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.data.verdict, 'Pending');
    assert.ok(res.data.data.submissionId);
  });
});
