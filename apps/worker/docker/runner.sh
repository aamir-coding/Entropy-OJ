#!/bin/bash
set -e

MODE="$1"
LANG="$2"
TIME_LIMIT_MS="${3:-1000}"

cd /workspace

if [ "$MODE" = "compile" ]; then
    if [ "$LANG" = "cpp" ]; then
        if g++ -O2 -std=c++17 -Wall -Wextra solution.cpp -o solution.out 2> compile_err.txt; then
            echo "0" > compile_status.txt
            exit 0
        else
            echo "1" > compile_status.txt
            exit 1
        fi
    elif [ "$LANG" = "python" ]; then
        if python3 -m py_compile solution.py 2> compile_err.txt; then
            echo "0" > compile_status.txt
            exit 0
        else
            echo "1" > compile_status.txt
            exit 1
        fi
    else
        echo "Unsupported language for compilation: $LANG" > compile_err.txt
        echo "1" > compile_status.txt
        exit 1
    fi

elif [ "$MODE" = "run" ]; then
    INPUT_FILE="/workspace/input.txt"
    OUTPUT_FILE="/workspace/output.txt"
    STDERR_FILE="/workspace/stderr.txt"
    METRICS_FILE="/workspace/metrics.txt"

    # Wall-clock timeout in seconds (with 2.5x grace margin for kill-switch)
    WALL_TIMEOUT_SEC=$(awk "BEGIN {print ($TIME_LIMIT_MS / 1000) * 2.5 + 0.5}")

    CMD=""
    if [ "$LANG" = "cpp" ]; then
        CMD="/workspace/solution.out"
    elif [ "$LANG" = "python" ]; then
        CMD="python3 /workspace/solution.py"
    else
        echo "Unsupported language: $LANG" > "$STDERR_FILE"
        exit 1
    fi

    # Execute with timeout and GNU time measurement
    set +e
    timeout -k 1s "${WALL_TIMEOUT_SEC}s" /usr/bin/time -o "$METRICS_FILE" \
        -f "WALL_SEC=%e\nUSER_SEC=%U\nSYS_SEC=%S\nMAX_RSS_KB=%M\nEXIT_CODE=%x" \
        $CMD < "$INPUT_FILE" > "$OUTPUT_FILE" 2> "$STDERR_FILE"
    
    EXEC_STATUS=$?
    set -e

    echo "PROCESS_EXIT_STATUS=$EXEC_STATUS" >> "$METRICS_FILE"
    exit 0
else
    echo "Unknown mode: $MODE"
    exit 1
fi
