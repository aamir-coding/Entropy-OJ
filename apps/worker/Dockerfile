FROM node:22-bookworm-slim

WORKDIR /app

# Install compiler toolchain directly in the worker image.
# This eliminates the need for Docker-outside-of-Docker and the separate entropy-runner image.
# - gcc/g++: C++ compilation (GCC 12, supports C++17)
# - python3: Python execution and py_compile validation
# - time: GNU time for execution metrics (CPU time, RSS memory)
# - coreutils: timeout, head, awk for sandboxing and output truncation
# - procps: process monitoring utilities
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    g++ \
    python3 \
    time \
    coreutils \
    procps \
    bash \
    && rm -rf /var/lib/apt/lists/*

# Create unprivileged runner user (UID 1001) for executing untrusted code
RUN groupadd -g 1001 runner && \
    useradd -u 1001 -g runner -m -s /bin/bash runner

# Create workspace directory with open permissions
RUN mkdir -p /tmp/workspaces && \
    chown -R runner:runner /tmp/workspaces && \
    chmod 777 /tmp/workspaces

# Copy runner script and make executable
COPY apps/worker/docker/runner_process.sh /usr/local/bin/runner_process.sh
RUN chmod +x /usr/local/bin/runner_process.sh

# Install Node.js dependencies
COPY package*.json ./
COPY packages/shared/package*.json ./packages/shared/
COPY apps/worker/package*.json ./apps/worker/

RUN npm install

COPY packages/shared ./packages/shared
COPY apps/worker ./apps/worker

RUN npm --workspace=packages/shared run build
RUN npm --workspace=apps/worker run build

CMD ["npm", "--workspace=apps/worker", "run", "start"]
