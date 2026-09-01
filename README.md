# Anti Online Judge — Sandboxed Competitive Programming & AI-Powered Evaluation Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![Node](https://img.shields.io/badge/Node.js-v22-green.svg)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/Docker-Sandboxed-2496ED.svg)](https://www.docker.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB.svg)](https://react.dev/)
[![BullMQ](https://img.shields.io/badge/BullMQ-Redis-red.svg)](https://bullmq.io/)
[![Google Gemini](https://img.shields.io/badge/AI-Gemini%20Flash%20%7C%20Groq%20%7C%20OpenRouter-purple.svg)](https://ai.google.dev/)

A modern, production-grade, sandboxed Online Judge and DSA learning platform. Built with the **MERN** stack (MongoDB, Express, React 19, Node.js), **Redis + BullMQ** asynchronous queues, **Docker** ephemeral container sandboxing for C++17 and Python 3.11, and a comprehensive **AI Intelligence Layer** (Socratic Debug Copilot, AI Problem QA Auditor, and Post-AC Complexity Classifier).

---

## 🏛️ System Architecture

The platform follows a decoupled, layered microservice architecture designed for isolation, defense-in-depth security, and horizontal scalability:

```mermaid
flowchart TB
    subgraph Client ["Presentation Layer (apps/client)"]
        UI["React 19 SPA + Monaco Code Editor"]
        KaTeX["KaTeX Math Engine + Markdown Renderer"]
        HintDrawer["Socratic AI Debug Copilot UI"]
        AdminStudio["Admin Problem Studio & Validator"]
        Poller["Smart Polling Engine"]
    end

    subgraph Server ["Application & AI Layer (apps/server)"]
        AuthAPI["Auth Controller (JWT in httpOnly Cookies)"]
        ProbAPI["Problems Controller & RBAC Middleware"]
        SubAPI["Submissions & Live Sample Runner"]
        AdminAPI["Admin Problem Lifecycle & Sandbox Validator"]
        AIController["AI Controller (Hints, Review, Classify)"]
        AIEngine["AI Provider Resiliency & Token-Bucket Limiter"]
        Producer["BullMQ Queue Producer"]
    end

    subgraph ExternalAI ["External AI Provider Fallback Chain"]
        Gemini["Google Gemini 2.5 Flash (~1M Context)"]
        Groq["Groq LLaMA 3.3 70B Versatile"]
        OpenRouter["OpenRouter DeepSeek / LLaMA Fallback"]
    end

    subgraph QueueLayer ["Queueing Layer"]
        SubQueue[("BullMQ: judge-submissions")]
        AIQueue[("BullMQ: ai-classify-jobs")]
    end

    subgraph ExecutionLayer ["Execution Layer (apps/worker)"]
        JudgeWorker["BullMQ Judge Worker (Concurrency: 2)"]
        SandboxMgr["Docker Sandbox Manager"]
        subgraph Runner ["Ephemeral Docker Container (per test case)"]
            DK["oj-runner:latest (g++-12 / python-3.11 / rusage)"]
        end
    end

    subgraph DataLayer ["Data Layer"]
        MongoDB[("MongoDB 7 (Users, Problems, TestCases, Solutions)")]
        RedisCache[("Redis 7 (BullMQ State & Rate Limiting)")]
    end

    UI -->|REST API (CORS + Cookies)| Server
    Poller -->|Poll /api/submissions/:id| SubAPI
    SubAPI -->|Enqueue Judge Job| SubQueue
    SubAPI -->|Create 'Pending' Solution| MongoDB

    AIController --> AIEngine
    AIEngine --> Gemini
    AIEngine -. Fallback .-> Groq
    AIEngine -. Fallback .-> OpenRouter

    JudgeWorker -->|Dequeue Job| SubQueue
    JudgeWorker -->|Fetch Test Cases| MongoDB
    JudgeWorker -->|Execute inside Sandbox| SandboxMgr
    SandboxMgr --> DK
    JudgeWorker -->|Write Verdict & Metrics| MongoDB

    AIQueue -->|Async Post-AC Classification| AIController
```

---

## ✨ Key Features & Capabilities

### 1. 🧑‍💻 Student & Competitor Experience
- **Split-Pane Problem Workspace**: Fully resizable independent panels with Monaco Code Editor, KaTeX math typesetting, and scroll-locked statement description.
- **Docked Multi-Tab Console**:
  - **Test Cases Tab**: View public sample inputs and outputs.
  - **Results Tab**: Live testcase run diagnostics, memory usage, and execution time.
  - **Diff Output Viewer**: Character-level comparison between expected vs actual output with whitespace normalization.
  - **Compiler Output Tab**: Formatted syntax and compilation diagnostics.
- **Dual Language Support**: C++17 (GCC 12) with fast I/O optimizations and Python 3.11 with standard libraries.
- **Submissions History & Code Inspection**: Review all previous submissions with verdict badges, execution metrics, and full modal code viewer.
- **User Analytics & Profile Hub**: Solved vs Attempted problem distribution, difficulty breakdowns (Easy, Medium, Hard), and personalized submission timeline.

---

### 2. 🧠 AI Intelligence Layer

#### 💡 Feature 1: Socratic Debug Copilot (Progressive 3-Tier Hints)
Guides students when they encounter `Wrong Answer`, `Time Limit Exceeded`, or `Runtime Error` without spoiling the answer:
- **Tier 1 (Algorithm & Direction)**: High-level conceptual guidance and algorithmic pattern nudges.
- **Tier 2 (Edge Case & Boundary)**: Boundary value hints (e.g., $N=0, 1$, negative numbers, overflow limits).
- **Tier 3 (Logic Bug & Optimization)**: Targeted logic diagnosis pointing to potential flaws in the approach.
- **Hard Security Guardrail**: Built-in **Code Block Stripper** (`stripCodeBlocks`) strictly removes any code fences, language syntax, or corrected snippets from model outputs before they reach the user.
- **Zero Hidden Test Case Leakage**: Only public sample test cases and student code are sent in AI prompts; hidden test case data is never exposed.

#### 🕵️ Feature 2: AI Problem-Setting QA Auditor (Gemini Flash ~1M Context)
A dedicated auditing tool for contest creators and problem setters:
- Comprehensive audit across statement, public samples, hidden judge cases, editorial, and reference model code.
- Detects **statement ambiguities**, **missing boundary/edge cases**, **adversarial inputs** (e.g. $O(N^2)$ TLE stress-tests), and **inconsistencies**.
- **Fault-Tolerant AI JSON Parser & Repair Engine** (`jsonRepair.ts`): Resilient multi-stage JSON extractor capable of repairing unescaped LaTeX backslashes (`\cdot`, `\le`), JavaScript expressions, trailing commas, and markdown wrappers.

#### 🏷️ Feature 3: Post-AC Approach & Complexity Classifier
- Automatically triggers upon `Accepted` verdict via an asynchronous background BullMQ job.
- Classifies algorithmic pattern (e.g., *Two Pointers*, *Monotonic Stack*, *Sliding Window*, *Dynamic Programming*), Big-O Time Complexity, Auxiliary Space Complexity, and suggests related harder problem codes.

---

### 3. 🛠️ Admin Problem Studio & Authoring Tool
- **Full Problem Authoring Lifecycle**: Interactive tabbed editor covering Metadata, Statement (Markdown + KaTeX split preview), Sample Cases, and Judge Test Cases.
- **Batch Test Case Importer**: JSON and raw delimiter bulk importer for large test suites.
- **Sandbox Model Solution Validator**: Run reference solutions in Python and C++ against all test cases inside the Docker sandbox with live diagnostic breakdowns before publishing.
- **Centralized Model Solutions**: Reference model solutions in both Python 3.11 and C++17 pre-configured for standard DSA problems.
- **Role-Based Access Control (RBAC)**: Strict `admin` middleware verification and cascading deletion of problems, test cases, and solution records.

---

## 🛡️ Sandboxed Execution & Security Architecture

Untrusted user code is executed in isolated, disposable Docker containers built on defense-in-depth principles:

| Security Dimension | Configuration | Purpose |
| :--- | :--- | :--- |
| **Network Isolation** | `--network none` | Completely prevents inbound/outbound calls, sockets, and data exfiltration. |
| **Memory Ceiling** | `--memory 256m` (or per problem) | Prevents host RAM exhaustion and memory leaks. |
| **CPU Throttling** | `--cpus 0.5` | Prevents CPU starvation; precise CPU user+system time measured via `rusage`. |
| **Process Limit** | `--pids-limit 64` | Prevents fork bombs and background thread spawning. |
| **Filesystem Hardening**| `--read-only` root fs | User code cannot modify system binaries or files. |
| **User Privileges** | Non-root UID 1001 (`runner`) | Container processes run with minimal Linux capabilities. |
| **BOLA / IDOR Protection**| Signed JWT httpOnly Cookies | Users can only inspect their own submission source code and history. |
| **Payload Protection** | Zod Schemas (Max 64 KB) | Prevents payload stuffing and database bloat. |

---

## 📂 Monorepo Structure

```
anti-online-judge/
├── packages/
│   └── shared/                 # Shared TypeScript types, schemas, constants & model solutions
│       ├── src/constants/      # Supported languages, limits, verdicts & model solutions
│       ├── src/types/          # API contracts, AI schemas, judge payloads & DB interfaces
│       ├── src/utils/          # Diff output normalization & comparison utility
│       └── src/validation/     # Zod schemas for auth, submissions & problem authoring
├── apps/
│   ├── server/                 # Express REST API, Mongoose models, BullMQ queues & AI layer
│   │   ├── src/ai/             # AI Provider fallback chain, Socratic hints, QA review, JSON repair
│   │   ├── src/controllers/    # Auth, Problem, Submission, Admin & AI controllers
│   │   ├── src/models/         # User, Problem, TestCase & Solution Mongoose schemas
│   │   ├── src/routes/         # Express API route declarations & rate limiters
│   │   ├── src/sandbox/        # Docker runner abstraction & compiler/execution wrappers
│   │   └── src/tests/          # Automated node:test integration & unit test suites
│   ├── worker/                 # BullMQ execution worker service
│   │   ├── src/evaluator/      # Sandboxed testcase evaluator & diff comparer
│   │   ├── src/sandbox/        # Docker container manager & rusage metrics extractor
│   │   └── Dockerfile.runner   # Ephemeral execution container image definition
│   └── client/                 # React 19 + Vite + Monaco Editor SPA
│       ├── src/components/     # Monaco Editor, Socratic Copilot Drawer, ViewCodeModal, Badges
│       ├── src/pages/          # ProblemListPage, ProblemDetailPage, ProfilePage, Auth
│       └── src/pages/admin/    # AdminDashboardPage & AdminProblemEditorPage
├── docker-compose.yml          # Full stack production orchestration
└── README.md                   # System documentation
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: `v20.x` or `v22.x`
- **Docker**: Docker Desktop / Docker Engine running
- **Redis & MongoDB**: Running locally (default ports `6379` and `27017`) or via Docker

---

### Step 1: Install Dependencies & Build Shared Library
```bash
# From workspace root
npm install
npm run build:shared
```

---

### Step 2: Configure Environment Variables
Create `.env` files in `apps/server`, `apps/worker`, and `apps/client` (or use `.env.example` templates):

**`apps/server/.env`**:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGO_URI=mongodb://localhost:27017/anti_oj
REDIS_URL=redis://localhost:6379
JWT_SECRET=super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=7d

# AI Intelligence Layer Configuration
GEMINI_API_KEY=your_gemini_api_key_here
GROQ_API_KEY=your_groq_api_key_here
OPENROUTER_API_KEY=your_openrouter_api_key_here

FEATURE_AI_HINTS=true
FEATURE_AI_REVIEW=true
FEATURE_AI_CLASSIFY=true
```

---

### Step 3: Build Sandbox Runner Docker Image
```bash
npm --workspace=apps/worker run build:image
```

---

### Step 4: Seed Database with Standard DSA Problems
```bash
npm run seed:server
```
*Seeds standard problems (**Two Sum**, **Valid Parentheses**, **Reverse Array**, **Longest Unique Substring**, **Maximum Subarray**, **Trapping Rain Water**) along with sample cases, hidden test cases, and default admin account (`admin@anti-oj.com` / `Admin123456!`).*

---

### Step 5: Start Development Services
Run the 3 applications concurrently:

```bash
# Terminal 1: REST API Server (Port 5000)
npm run dev:server

# Terminal 2: Execution Worker Service
npm run dev:worker

# Terminal 3: React SPA Client (Port 5173)
npm run dev:client
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🐳 Full Docker Compose Deployment

To build and run the entire multi-container stack in production mode:

```bash
docker compose up --build
```
Access the application at `http://localhost`.

---

## 🧪 Automated Test Suites

The codebase includes thorough test coverage across shared types, sandboxed execution, REST APIs, and AI utilities:

```bash
# 1. Run Shared Package Tests (Diff Output & Normalization)
npm run test:shared

# 2. Run Execution Worker Tests (Docker Sandbox, TLE, RTE, CE, AC)
npm run test:worker

# 3. Run Server Integration Tests (REST APIs, Auth, Admin Lifecycle)
npm run test:server

# 4. Run Model Solutions Validation Tests (C++ and Python reference solutions)
npm --workspace=apps/server test dist/tests/modelSolutions.test.js

# 5. Run AI JSON Repair & Parser Tests
npm --workspace=apps/server test dist/tests/jsonRepair.test.js
```

---

## 📑 API Endpoints Reference

### 🔐 Authentication
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new account & set JWT cookie |
| `POST` | `/api/auth/login` | Public | Authenticate user & set JWT cookie |
| `POST` | `/api/auth/logout` | Public | Clear JWT authentication cookie |
| `GET` | `/api/auth/me` | Required | Retrieve user profile, role & solve stats |

### 📚 Problems
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/problems` | Public | List problems with search, difficulty & tags |
| `GET` | `/api/problems/:identifier` | Public | Retrieve problem statement & sample test cases |

### ⚡ Submissions & Live Runner
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/submissions/run` | Required | Execute code against public sample cases (Live Runner) |
| `POST` | `/api/submissions` | Required | Enqueue submission for full sandboxed evaluation |
| `GET` | `/api/submissions/:id` | Required | Poll evaluation status, verdict, runtime & memory |
| `GET` | `/api/submissions/problem/:id` | Required | Retrieve current user's submissions for a problem |
| `GET` | `/api/submissions/user/:userId` | Required | Retrieve user's historical submissions (BOLA protected) |

### 🤖 AI Copilot & QA Auditor
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/ai/hint` | Required | Request 3-tier Socratic debug hint for failing code |
| `POST` | `/api/ai/review` | Admin | Run full package AI QA audit (Gemini Flash) |

### 🛠️ Admin Problem Management
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/admin/problems` | Admin | List all problems including hidden test case counts |
| `GET` | `/api/admin/problems/:id` | Admin | Get full problem package including hidden judge cases |
| `POST` | `/api/admin/problems` | Admin | Create new problem with sample & hidden test cases |
| `PUT` | `/api/admin/problems/:id` | Admin | Update problem details, constraints & test suites |
| `DELETE` | `/api/admin/problems/:id` | Admin | Permanently cascade delete problem and associated data |
| `POST` | `/api/admin/problems/:id/validate` | Admin | Execute model solution against all judge cases in Docker |

---

## ⚖️ License
ISC License © 2026 Anti Online Judge
