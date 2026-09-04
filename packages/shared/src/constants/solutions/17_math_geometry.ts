import { IProblemModelSolutions } from './types';

export const MATH_GEOMETRY_SOLUTIONS: Record<string, IProblemModelSolutions> = {
  'rotate-image': {
    python: `import sys

def solve():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    n = int(tokens[0])
    idx = 1
    matrix = []
    for _ in range(n):
        matrix.append(tokens[idx:idx + n])
        idx += n

    # Transpose
    for i in range(n):
        for j in range(i + 1, n):
            matrix[i][j], matrix[j][i] = matrix[j][i], matrix[i][j]

    # Reverse each row
    for i in range(n):
        matrix[i].reverse()
        print(" ".join(matrix[i]))

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

    int n;
    if (!(cin >> n)) return 0;

    vector<vector<int>> matrix(n, vector<int>(n));
    for (int i = 0; i < n; ++i) {
        for (int j = 0; j < n; ++j) {
            cin >> matrix[i][j];
        }
    }

    for (int i = 0; i < n; ++i) {
        for (int j = i + 1; j < n; ++j) {
            swap(matrix[i][j], matrix[j][i]);
        }
    }

    for (int i = 0; i < n; ++i) {
        reverse(matrix[i].begin(), matrix[i].end());
        for (int j = 0; j < n; ++j) {
            cout << matrix[i][j] << (j + 1 == n ? "" : " ");
        }
        cout << "\\n";
    }

    return 0;
}
`,
  },

  'spiral-matrix': {
    python: `import sys

def solve():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    m = int(tokens[0])
    n = int(tokens[1])
    idx = 2
    matrix = []
    for _ in range(m):
        matrix.append(tokens[idx:idx + n])
        idx += n

    top, bottom = 0, m - 1
    left, right = 0, n - 1
    res = []

    while top <= bottom and left <= right:
        for c in range(left, right + 1):
            res.append(matrix[top][c])
        top += 1

        for r in range(top, bottom + 1):
            res.append(matrix[r][right])
        right -= 1

        if top <= bottom:
            for c in range(right, left - 1, -1):
                res.append(matrix[bottom][c])
            bottom -= 1

        if left <= right:
            for r in range(bottom, top - 1, -1):
                res.append(matrix[r][left])
            left += 1

    print(" ".join(res))

if __name__ == '__main__':
    solve()
`,
    cpp: `#include <iostream>
#include <vector>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int m, n;
    if (!(cin >> m >> n)) return 0;

    vector<vector<int>> matrix(m, vector<int>(n));
    for (int i = 0; i < m; ++i) {
        for (int j = 0; j < n; ++j) {
            cin >> matrix[i][j];
        }
    }

    int top = 0, bottom = m - 1;
    int left = 0, right = n - 1;
    vector<int> res;

    while (top <= bottom && left <= right) {
        for (int c = left; c <= right; ++c) res.push_back(matrix[top][c]);
        top++;

        for (int r = top; r <= bottom; ++r) res.push_back(matrix[r][right]);
        right--;

        if (top <= bottom) {
            for (int c = right; c >= left; --c) res.push_back(matrix[bottom][c]);
            bottom--;
        }

        if (left <= right) {
            for (int r = bottom; r >= top; --r) res.push_back(matrix[r][left]);
            left++;
        }
    }

    for (size_t i = 0; i < res.size(); ++i) {
        cout << res[i] << (i + 1 == res.size() ? "" : " ");
    }
    cout << "\\n";

    return 0;
}
`,
  },

  'set-matrix-zeroes': {
    python: `import sys

def solve():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    m = int(tokens[0])
    n = int(tokens[1])
    idx = 2
    matrix = []
    for _ in range(m):
        matrix.append([int(x) for x in tokens[idx:idx + n]])
        idx += n

    row_zero = False
    for r in range(m):
        for c in range(n):
            if matrix[r][c] == 0:
                matrix[0][c] = 0
                if r > 0:
                    matrix[r][0] = 0
                else:
                    row_zero = True

    for r in range(1, m):
        for c in range(1, n):
            if matrix[0][c] == 0 or matrix[r][0] == 0:
                matrix[r][c] = 0

    if matrix[0][0] == 0:
        for r in range(m):
            matrix[r][0] = 0

    if row_zero:
        for c in range(n):
            matrix[0][c] = 0

    for r in range(m):
        print(" ".join(map(str, matrix[r])))

if __name__ == '__main__':
    solve()
`,
    cpp: `#include <iostream>
#include <vector>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int m, n;
    if (!(cin >> m >> n)) return 0;

    vector<vector<long long>> matrix(m, vector<long long>(n));
    for (int i = 0; i < m; ++i) {
        for (int j = 0; j < n; ++j) {
            cin >> matrix[i][j];
        }
    }

    bool rowZero = false;
    for (int r = 0; r < m; ++r) {
        for (int c = 0; c < n; ++c) {
            if (matrix[r][c] == 0) {
                matrix[0][c] = 0;
                if (r > 0) matrix[r][0] = 0;
                else rowZero = true;
            }
        }
    }

    for (int r = 1; r < m; ++r) {
        for (int c = 1; c < n; ++c) {
            if (matrix[0][c] == 0 || matrix[r][0] == 0) {
                matrix[r][c] = 0;
            }
        }
    }

    if (matrix[0][0] == 0) {
        for (int r = 0; r < m; ++r) matrix[r][0] = 0;
    }

    if (rowZero) {
        for (int c = 0; c < n; ++c) matrix[0][c] = 0;
    }

    for (int r = 0; r < m; ++r) {
        for (int c = 0; c < n; ++c) {
            cout << matrix[r][c] << (c + 1 == n ? "" : " ");
        }
        cout << "\\n";
    }

    return 0;
}
`,
  },

  'happy-number': {
    python: `import sys

def get_next(n):
    total = 0
    while n > 0:
        d = n % 10
        total += d * d
        n //= 10
    return total

def solve():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    n = int(tokens[0])

    slow = n
    fast = get_next(n)

    while fast != 1 and slow != fast:
        slow = get_next(slow)
        fast = get_next(get_next(fast))

    print("true" if fast == 1 else "false")

if __name__ == '__main__':
    solve()
`,
    cpp: `#include <iostream>

using namespace std;

long long getNext(long long n) {
    long long total = 0;
    while (n > 0) {
        long long d = n % 10;
        total += d * d;
        n /= 10;
    }
    return total;
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    long long n;
    if (!(cin >> n)) return 0;

    long long slow = n;
    long long fast = getNext(n);

    while (fast != 1 && slow != fast) {
        slow = getNext(slow);
        fast = getNext(getNext(fast));
    }

    cout << (fast == 1 ? "true" : "false") << "\\n";
    return 0;
}
`,
  },

  'plus-one': {
    python: `import sys

def solve():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    n = int(tokens[0])
    digits = [int(x) for x in tokens[1:1 + n]]

    for i in range(n - 1, -1, -1):
        if digits[i] < 9:
            digits[i] += 1
            print(" ".join(map(str, digits)))
            return
        digits[i] = 0

    print(" ".join(map(str, [1] + digits)))

if __name__ == '__main__':
    solve()
`,
    cpp: `#include <iostream>
#include <vector>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int n;
    if (!(cin >> n)) return 0;

    vector<int> digits(n);
    for (int i = 0; i < n; ++i) cin >> digits[i];

    for (int i = n - 1; i >= 0; --i) {
        if (digits[i] < 9) {
            digits[i]++;
            for (int j = 0; j < n; ++j) {
                cout << digits[j] << (j + 1 == n ? "" : " ");
            }
            cout << "\\n";
            return 0;
        }
        digits[i] = 0;
    }

    cout << 1;
    for (int i = 0; i < n; ++i) {
        cout << " " << digits[i];
    }
    cout << "\\n";
    return 0;
}
`,
  },

  'powx-n': {
    python: `import sys

def solve():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    x = float(tokens[0])
    n = int(tokens[1])

    if n < 0:
        x = 1 / x
        n = -n

    res = 1.0
    while n > 0:
        if n % 2 == 1:
            res *= x
        x *= x
        n //= 2

    print(f"{res:.5f}")

if __name__ == '__main__':
    solve()
`,
    cpp: `#include <iostream>
#include <iomanip>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    double x;
    long long n;
    if (!(cin >> x >> n)) return 0;

    if (n < 0) {
        x = 1.0 / x;
        n = -n;
    }

    double res = 1.0;
    while (n > 0) {
        if (n % 2 == 1) res *= x;
        x *= x;
        n /= 2;
    }

    cout << fixed << setprecision(5) << res << "\\n";
    return 0;
}
`,
  },

  'multiply-strings': {
    python: `import sys

def solve():
    tokens = sys.stdin.read().split()
    if len(tokens) < 2:
        return
    num1, num2 = tokens[0], tokens[1]
    if num1 == "0" or num2 == "0":
        print("0")
        return

    m, n = len(num1), len(num2)
    res = [0] * (m + n)

    for i in range(m - 1, -1, -1):
        for j in range(n - 1, -1, -1):
            mul = int(num1[i]) * int(num2[j])
            p1 = i + j
            p2 = i + j + 1
            total = mul + res[p2]
            res[p2] = total % 10
            res[p1] += total // 10

    res_str = "".join(map(str, res)).lstrip("0")
    print(res_str if res_str else "0")

if __name__ == '__main__':
    solve()
`,
    cpp: `#include <iostream>
#include <string>
#include <vector>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    string num1, num2;
    if (!(cin >> num1 >> num2)) return 0;

    if (num1 == "0" || num2 == "0") {
        cout << "0\\n";
        return 0;
    }

    int m = num1.length(), n = num2.length();
    vector<int> res(m + n, 0);

    for (int i = m - 1; i >= 0; --i) {
        for (int j = n - 1; j >= 0; --j) {
            int mul = (num1[i] - '0') * (num2[j] - '0');
            int p1 = i + j, p2 = i + j + 1;
            int total = mul + res[p2];
            res[p2] = total % 10;
            res[p1] += total / 10;
        }
    }

    size_t start = 0;
    while (start < res.size() && res[start] == 0) start++;

    string out = "";
    for (size_t i = start; i < res.size(); ++i) {
        out += to_string(res[i]);
    }

    cout << (out.empty() ? "0" : out) << "\\n";
    return 0;
}
`,
  },

  'detect-squares': {
    python: `import sys
from collections import defaultdict

def solve():
    input_data = sys.stdin.read().split()
    if not input_data:
        return

    q = int(input_data[0])
    idx = 1

    counts = defaultdict(int)
    points = []

    for _ in range(q):
        cmd = input_data[idx]
        x = int(input_data[idx + 1])
        y = int(input_data[idx + 2])
        idx += 3

        if cmd == "add":
            counts[(x, y)] += 1
            points.append((x, y))
        elif cmd == "count":
            total = 0
            for px, py in points:
                if abs(px - x) != abs(py - y) or px == x or py == y:
                    continue
                total += counts[(px, y)] * counts[(x, py)]
            print(total)

if __name__ == '__main__':
    solve()
`,
    cpp: `#include <iostream>
#include <vector>
#include <unordered_map>
#include <cmath>
#include <string>

using namespace std;

struct PairHash {
    size_t operator()(const pair<int, int>& p) const {
        return ((size_t)p.first << 16) ^ (size_t)p.second;
    }
};

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int q;
    if (!(cin >> q)) return 0;

    unordered_map<pair<int, int>, int, PairHash> counts;
    vector<pair<int, int>> points;

    while (q--) {
        string cmd;
        int x, y;
        cin >> cmd >> x >> y;

        if (cmd == "add") {
            counts[{x, y}]++;
            points.push_back({x, y});
        } else if (cmd == "count") {
            long long total = 0;
            for (const auto& [px, py] : points) {
                if (abs(px - x) != abs(py - y) || px == x || py == y) continue;
                auto it1 = counts.find({px, y});
                auto it2 = counts.find({x, py});
                if (it1 != counts.end() && it2 != counts.end()) {
                    total += it1->second * it2->second;
                }
            }
            cout << total << "\\n";
        }
    }

    return 0;
}
`,
  },
};
