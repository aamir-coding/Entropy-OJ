#!/bin/bash
# ============================================================
#  Entropy Online Judge — Direct Process Runner Script
#
#  Executes user-submitted code directly on the host using
#  ulimit-based sandboxing instead of Docker containers.
#  Produces the same metrics output format as the original
#  Docker-based runner.sh for full backward compatibility.
#
#  Usage:
#    runner_process.sh compile <lang> [timeLimitMs]
#    runner_process.sh run <lang> <timeLimitMs>
# ============================================================
set -e

MODE="$1"
LANG="$2"
TIME_LIMIT_MS="${3:-1000}"

# Validate TIME_LIMIT_MS is a positive integer
if ! [[ "$TIME_LIMIT_MS" =~ ^[0-9]+$ ]] || [ "$TIME_LIMIT_MS" -le 0 ]; then
    TIME_LIMIT_MS=1000
fi

# Use working directory passed from parent process or fallback to $PWD
WORKSPACE_DIR="${PWD}"
cd "$WORKSPACE_DIR"

# Locate GNU time binary
TIME_BIN=$(command -v time || which time || echo "/usr/bin/time")

# Privilege dropping: run untrusted code as unprivileged 'runner' user if running as root
RUN_AS=""
if [ "$(id -u)" -eq 0 ] && id -u runner >/dev/null 2>&1; then
    RUN_AS="runuser -u runner --"
fi

if [ "$MODE" = "compile" ]; then
    COMPILE_ERR="$WORKSPACE_DIR/compile_err.txt"
    COMPILE_STATUS="$WORKSPACE_DIR/compile_status.txt"

    if [ "$LANG" = "cpp" ]; then
        if g++ -O2 -std=c++17 -Wall -Wextra "$WORKSPACE_DIR/solution.cpp" -o "$WORKSPACE_DIR/solution.out" 2> "$COMPILE_ERR"; then
            echo "0" > "$COMPILE_STATUS"
            chmod 755 "$WORKSPACE_DIR/solution.out" 2>/dev/null || true
            exit 0
        else
            if [ -f "$COMPILE_ERR" ]; then
                head -c 65536 "$COMPILE_ERR" > "${COMPILE_ERR}.tmp" && mv "${COMPILE_ERR}.tmp" "$COMPILE_ERR"
            fi
            echo "1" > "$COMPILE_STATUS"
            exit 1
        fi
    elif [ "$LANG" = "python" ]; then
        if python3 -m py_compile "$WORKSPACE_DIR/solution.py" 2> "$COMPILE_ERR"; then
            echo "0" > "$COMPILE_STATUS"
            exit 0
        else
            if [ -f "$COMPILE_ERR" ]; then
                head -c 65536 "$COMPILE_ERR" > "${COMPILE_ERR}.tmp" && mv "${COMPILE_ERR}.tmp" "$COMPILE_ERR"
            fi
            echo "1" > "$COMPILE_STATUS"
            exit 1
        fi
    else
        echo "Unsupported language for compilation: $LANG" > "$COMPILE_ERR"
        echo "1" > "$COMPILE_STATUS"
        exit 1
    fi

elif [ "$MODE" = "run" ]; then
    INPUT_FILE="$WORKSPACE_DIR/input.txt"
    OUTPUT_FILE="$WORKSPACE_DIR/output.txt"
    STDERR_FILE="$WORKSPACE_DIR/stderr.txt"
    METRICS_FILE="$WORKSPACE_DIR/metrics.txt"

    touch "$OUTPUT_FILE" "$STDERR_FILE" "$METRICS_FILE"
    chmod 666 "$OUTPUT_FILE" "$STDERR_FILE" "$METRICS_FILE" 2>/dev/null || true

    # Wall-clock timeout in seconds (with 2.5x grace margin)
    WALL_TIMEOUT_SEC=$(awk "BEGIN {print ($TIME_LIMIT_MS / 1000) * 2.5 + 0.5}")

    # Strict language allowlist and binary mapping
    if [ "$LANG" = "cpp" ]; then
        PROGRAM_BIN="$WORKSPACE_DIR/solution.out"
        if [ ! -f "$PROGRAM_BIN" ]; then
            echo "Binary not found" > "$STDERR_FILE"
            exit 1
        fi
        RUN_CMD=("$PROGRAM_BIN")
    elif [ "$LANG" = "python" ]; then
        RUN_CMD=("python3" "$WORKSPACE_DIR/solution.py")
    else
        echo "Unsupported language: $LANG" > "$STDERR_FILE"
        exit 1
    fi

    # ── Process-level sandboxing via ulimit ──
    # File output ceiling: 131072 blocks = 64MB (prevents disk exhaustion)
    ulimit -f 131072 2>/dev/null || true
    # Max processes/threads: prevents fork bombs
    ulimit -u 64 2>/dev/null || true

    # Execute with timeout and GNU time measurement
    set +e
    if [ -n "$RUN_AS" ]; then
        $RUN_AS timeout -k 1s "${WALL_TIMEOUT_SEC}s" $TIME_BIN -o "$METRICS_FILE" \
            -f "WALL_SEC=%e\nUSER_SEC=%U\nSYS_SEC=%S\nMAX_RSS_KB=%M\nEXIT_CODE=%x" \
            "${RUN_CMD[@]}" < "$INPUT_FILE" > "$OUTPUT_FILE" 2> "$STDERR_FILE"
        EXEC_STATUS=$?
    else
        timeout -k 1s "${WALL_TIMEOUT_SEC}s" $TIME_BIN -o "$METRICS_FILE" \
            -f "WALL_SEC=%e\nUSER_SEC=%U\nSYS_SEC=%S\nMAX_RSS_KB=%M\nEXIT_CODE=%x" \
            "${RUN_CMD[@]}" < "$INPUT_FILE" > "$OUTPUT_FILE" 2> "$STDERR_FILE"
        EXEC_STATUS=$?
    fi
    set -e

    # Safely truncate output and stderr to 64KB
    if [ -f "$OUTPUT_FILE" ]; then
        head -c 65536 "$OUTPUT_FILE" > "${OUTPUT_FILE}.tmp" && mv "${OUTPUT_FILE}.tmp" "$OUTPUT_FILE"
    fi
    if [ -f "$STDERR_FILE" ]; then
        head -c 65536 "$STDERR_FILE" > "${STDERR_FILE}.tmp" && mv "${STDERR_FILE}.tmp" "$STDERR_FILE"
    fi

    echo "PROCESS_EXIT_STATUS=$EXEC_STATUS" >> "$METRICS_FILE"
    exit 0
else
    echo "Unknown mode: $MODE"
    exit 1
fi
