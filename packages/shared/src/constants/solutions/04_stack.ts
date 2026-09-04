import { IProblemModelSolutions } from './types';

export const STACK_SOLUTIONS: Record<string, IProblemModelSolutions> = {
  'valid-parentheses': {
    python: `import sys

def is_valid(s: str) -> bool:
    stack = []
    mapping = {')': '(', '}': '{', ']': '['}
    for char in s:
        if char in mapping:
            top = stack.pop() if stack else '#'
            if mapping[char] != top:
                return False
        else:
            stack.append(char)
    return len(stack) == 0

def solve():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    t = int(tokens[0])
    results = []
    for i in range(1, t + 1):
        if i < len(tokens):
            results.append("true" if is_valid(tokens[i]) else "false")
        else:
            results.append("true")
    print('\\n'.join(results))

if __name__ == '__main__':
    solve()
`,
    cpp: `#include <iostream>
#include <string>
#include <stack>
#include <vector>

using namespace std;

bool isValid(const string& s) {
    stack<char> st;
    for (char c : s) {
        if (c == '(' || c == '{' || c == '[') {
            st.push(c);
        } else {
            if (st.empty()) return false;
            char top = st.top();
            st.pop();
            if ((c == ')' && top != '(') ||
                (c == '}' && top != '{') ||
                (c == ']' && top != '[')) {
                return false;
            }
        }
    }
    return st.empty();
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int t;
    if (!(cin >> t)) return 0;

    while (t--) {
        string s;
        if (cin >> s) {
            cout << (isValid(s) ? "true" : "false") << "\\n";
        }
    }

    return 0;
}
`,
  },

  'min-stack': {
    python: `import sys

def solve():
    lines = sys.stdin.read().splitlines()
    if not lines:
        return
    q = int(lines[0].strip())
    stack = []
    min_stack = []

    for i in range(1, q + 1):
        if i >= len(lines):
            break
        cmd = lines[i].strip().split()
        if not cmd:
            continue
        op = cmd[0]
        if op == 'push':
            val = int(cmd[1])
            stack.append(val)
            if not min_stack or val <= min_stack[-1]:
                min_stack.append(val)
            else:
                min_stack.append(min_stack[-1])
        elif op == 'pop':
            if stack:
                stack.pop()
                min_stack.pop()
        elif op == 'top':
            if stack:
                print(stack[-1])
        elif op == 'getMin':
            if min_stack:
                print(min_stack[-1])

if __name__ == '__main__':
    solve()
`,
    cpp: `#include <iostream>
#include <vector>
#include <string>
#include <algorithm>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int q;
    if (!(cin >> q)) return 0;

    vector<long long> valStack;
    vector<long long> minStack;
    valStack.reserve(q);
    minStack.reserve(q);

    while (q--) {
        string op;
        cin >> op;
        if (op == "push") {
            long long val;
            cin >> val;
            valStack.push_back(val);
            if (minStack.empty() || val < minStack.back()) {
                minStack.push_back(val);
            } else {
                minStack.push_back(minStack.back());
            }
        } else if (op == "pop") {
            if (!valStack.empty()) {
                valStack.pop_back();
                minStack.pop_back();
            }
        } else if (op == "top") {
            if (!valStack.empty()) {
                cout << valStack.back() << "\\n";
            }
        } else if (op == "getMin") {
            if (!minStack.empty()) {
                cout << minStack.back() << "\\n";
            }
        }
    }

    return 0;
}
`,
  },

  'evaluate-reverse-polish-notation': {
    python: `import sys

def solve():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    n = int(tokens[0])
    expr = tokens[1:1 + n]

    stack = []
    for token in expr:
        if token in ("+", "-", "*", "/"):
            b = stack.pop()
            a = stack.pop()
            if token == "+":
                stack.append(a + b)
            elif token == "-":
                stack.append(a - b)
            elif token == "*":
                stack.append(a * b)
            elif token == "/":
                stack.append(int(a / b))
        else:
            stack.append(int(token))

    if stack:
        print(stack[-1])

if __name__ == '__main__':
    solve()
`,
    cpp: `#include <iostream>
#include <vector>
#include <string>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int n;
    if (!(cin >> n)) return 0;

    vector<long long> st;
    st.reserve(n);

    for (int i = 0; i < n; ++i) {
        string token;
        cin >> token;

        if (token == "+" || token == "-" || token == "*" || token == "/") {
            long long b = st.back(); st.pop_back();
            long long a = st.back(); st.pop_back();
            if (token == "+") st.push_back(a + b);
            else if (token == "-") st.push_back(a - b);
            else if (token == "*") st.push_back(a * b);
            else if (token == "/") st.push_back(a / b);
        } else {
            st.push_back(stoll(token));
        }
    }

    if (!st.empty()) {
        cout << st.back() << "\\n";
    }

    return 0;
}
`,
  },

  'generate-parentheses': {
    python: `import sys

def solve():
    raw = sys.stdin.read().split()
    if not raw:
        return
    n = int(raw[0])
    res = []

    def backtrack(curr, open_cnt, close_cnt):
        if len(curr) == 2 * n:
            res.append(curr)
            return
        if open_cnt < n:
            backtrack(curr + "(", open_cnt + 1, close_cnt)
        if close_cnt < open_cnt:
            backtrack(curr + ")", open_cnt, close_cnt + 1)

    backtrack("", 0, 0)
    res.sort()
    for s in res:
        print(s)

if __name__ == '__main__':
    solve()
`,
    cpp: `#include <iostream>
#include <vector>
#include <string>
#include <algorithm>

using namespace std;

void backtrack(int n, int openCnt, int closeCnt, string& curr, vector<string>& res) {
    if ((int)curr.length() == 2 * n) {
        res.push_back(curr);
        return;
    }
    if (openCnt < n) {
        curr.push_back('(');
        backtrack(n, openCnt + 1, closeCnt, curr, res);
        curr.pop_back();
    }
    if (closeCnt < openCnt) {
        curr.push_back(')');
        backtrack(n, openCnt, closeCnt + 1, curr, res);
        curr.pop_back();
    }
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int n;
    if (!(cin >> n)) return 0;

    vector<string> res;
    string curr = "";
    backtrack(n, 0, 0, curr, res);
    sort(res.begin(), res.end());

    for (const string& s : res) {
        cout << s << "\\n";
    }

    return 0;
}
`,
  },

  'daily-temperatures': {
    python: `import sys

def solve():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    n = int(tokens[0])
    temps = [int(x) for x in tokens[1:1 + n]]

    ans = [0] * n
    stack = [] # indices

    for i in range(n):
        while stack and temps[i] > temps[stack[-1]]:
            prev_idx = stack.pop()
            ans[prev_idx] = i - prev_idx
        stack.append(i)

    print(" ".join(map(str, ans)))

if __name__ == '__main__':
    solve()
`,
    cpp: `#include <iostream>
#include <vector>
#include <stack>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int n;
    if (!(cin >> n)) return 0;

    vector<int> temps(n);
    for (int i = 0; i < n; ++i) cin >> temps[i];

    vector<int> ans(n, 0);
    stack<int> st;

    for (int i = 0; i < n; ++i) {
        while (!st.empty() && temps[i] > temps[st.top()]) {
            int prevIdx = st.top();
            st.pop();
            ans[prevIdx] = i - prevIdx;
        }
        st.push(i);
    }

    for (int i = 0; i < n; ++i) {
        cout << ans[i] << (i + 1 == n ? "" : " ");
    }
    cout << "\\n";

    return 0;
}
`,
  },

  'car-fleet': {
    python: `import sys

def solve():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    target = int(tokens[0])
    n = int(tokens[1])
    position = [int(x) for x in tokens[2:2 + n]]
    speed = [int(x) for x in tokens[2 + n:2 + 2 * n]]

    pair = sorted(zip(position, speed), key=lambda x: x[0], reverse=True)
    fleets = 0
    curr_max_time = 0.0

    for pos, spd in pair:
        time = (target - pos) / spd
        if time > curr_max_time:
            fleets += 1
            curr_max_time = time

    print(fleets)

if __name__ == '__main__':
    solve()
`,
    cpp: `#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    long long target;
    int n;
    if (!(cin >> target >> n)) return 0;

    vector<pair<long long, long long>> cars(n);
    for (int i = 0; i < n; ++i) cin >> cars[i].first;
    for (int i = 0; i < n; ++i) cin >> cars[i].second;

    sort(cars.begin(), cars.end(), [](const pair<long long, long long>& a, const pair<long long, long long>& b) {
        return a.first > b.first;
    });

    int fleets = 0;
    double maxTime = 0.0;

    for (int i = 0; i < n; ++i) {
        double time = (double)(target - cars[i].first) / cars[i].second;
        if (time > maxTime) {
            fleets++;
            maxTime = time;
        }
    }

    cout << fleets << "\\n";
    return 0;
}
`,
  },

  'largest-rectangle-in-histogram': {
    python: `import sys

def solve():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    n = int(tokens[0])
    heights = [int(x) for x in tokens[1:1 + n]]

    stack = [] # (index, height)
    max_area = 0

    for i, h in enumerate(heights):
        start = i
        while stack and stack[-1][1] > h:
            idx, height = stack.pop()
            max_area = max(max_area, height * (i - idx))
            start = idx
        stack.append((start, h))

    for idx, height in stack:
        max_area = max(max_area, height * (n - idx))

    print(max_area)

if __name__ == '__main__':
    solve()
`,
    cpp: `#include <iostream>
#include <vector>
#include <stack>
#include <algorithm>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int n;
    if (!(cin >> n)) return 0;

    vector<long long> heights(n);
    for (int i = 0; i < n; ++i) cin >> heights[i];

    stack<pair<int, long long>> st;
    long long maxArea = 0;

    for (int i = 0; i < n; ++i) {
        int start = i;
        while (!st.empty() && st.top().second > heights[i]) {
            int idx = st.top().first;
            long long h = st.top().second;
            st.pop();
            maxArea = max(maxArea, h * (i - idx));
            start = idx;
        }
        st.push({start, heights[i]});
    }

    while (!st.empty()) {
        int idx = st.top().first;
        long long h = st.top().second;
        st.pop();
        maxArea = max(maxArea, h * (n - idx));
    }

    cout << maxArea << "\\n";
    return 0;
}
`,
  },
};
