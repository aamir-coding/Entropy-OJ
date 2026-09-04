import { IProblemModelSolutions } from './types';

export const TWO_D_DP_SOLUTIONS: Record<string, IProblemModelSolutions> = {
  'unique-paths': {
    python: `import sys
import math

def solve():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    m = int(tokens[0])
    n = int(tokens[1])
    print(math.comb(m + n - 2, m - 1))

if __name__ == '__main__':
    solve()
`,
    cpp: `#include <iostream>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int m, n;
    if (!(cin >> m >> n)) return 0;

    long long ans = 1;
    int k = min(m - 1, n - 1);
    for (int i = 1; i <= k; ++i) {
        ans = ans * (m + n - 1 - i) / i;
    }

    cout << ans << "\\n";
    return 0;
}
`,
  },

  'longest-common-subsequence': {
    python: `import sys

def solve():
    tokens = sys.stdin.read().split()
    if len(tokens) < 2:
        print(0)
        return
    s1, s2 = tokens[0], tokens[1]
    m, n = len(s1), len(s2)

    dp = [0] * (n + 1)
    for i in range(1, m + 1):
        prev = 0
        for j in range(1, n + 1):
            temp = dp[j]
            if s1[i - 1] == s2[j - 1]:
                dp[j] = prev + 1
            else:
                dp[j] = max(dp[j], dp[j - 1])
            prev = temp

    print(dp[n])

if __name__ == '__main__':
    solve()
`,
    cpp: `#include <iostream>
#include <string>
#include <vector>
#include <algorithm>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    string s1, s2;
    if (!(cin >> s1 >> s2)) {
        cout << 0 << "\\n";
        return 0;
    }

    int m = s1.length(), n = s2.length();
    vector<int> dp(n + 1, 0);

    for (int i = 1; i <= m; ++i) {
        int prev = 0;
        for (int j = 1; j <= n; ++j) {
            int temp = dp[j];
            if (s1[i - 1] == s2[j - 1]) {
                dp[j] = prev + 1;
            } else {
                dp[j] = max(dp[j], dp[j - 1]);
            }
            prev = temp;
        }
    }

    cout << dp[n] << "\\n";
    return 0;
}
`,
  },

  'best-time-to-buy-and-sell-stock-with-cooldown': {
    python: `import sys

def solve():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    n = int(tokens[0])
    prices = [int(x) for x in tokens[1:1 + n]]

    if n <= 1:
        print(0)
        return

    held = -prices[0]
    sold = 0
    cooldown = 0

    for p in prices[1:]:
        prev_sold = sold
        sold = held + p
        held = max(held, cooldown - p)
        cooldown = max(cooldown, prev_sold)

    print(max(sold, cooldown))

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
    if (!(cin >> n) || n <= 1) {
        cout << 0 << "\\n";
        return 0;
    }

    vector<int> prices(n);
    for (int i = 0; i < n; ++i) cin >> prices[i];

    int held = -prices[0];
    int sold = 0;
    int cooldown = 0;

    for (int i = 1; i < n; ++i) {
        int prevSold = sold;
        sold = held + prices[i];
        held = max(held, cooldown - prices[i]);
        cooldown = max(cooldown, prevSold);
    }

    cout << max(sold, cooldown) << "\\n";
    return 0;
}
`,
  },

  'coin-change-ii': {
    python: `import sys

def solve():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    amount = int(tokens[0])
    n = int(tokens[1])
    coins = [int(x) for x in tokens[2:2 + n]]

    dp = [0] * (amount + 1)
    dp[0] = 1

    for c in coins:
        for i in range(c, amount + 1):
            dp[i] += dp[i - c]

    print(dp[amount])

if __name__ == '__main__':
    solve()
`,
    cpp: `#include <iostream>
#include <vector>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int amount, n;
    if (!(cin >> amount >> n)) return 0;

    vector<int> coins(n);
    for (int i = 0; i < n; ++i) cin >> coins[i];

    vector<unsigned long long> dp(amount + 1, 0);
    dp[0] = 1;

    for (int c : coins) {
        for (int i = c; i <= amount; ++i) {
            dp[i] += dp[i - c];
        }
    }

    cout << dp[amount] << "\\n";
    return 0;
}
`,
  },

  'target-sum': {
    python: `import sys

def solve():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    n = int(tokens[0])
    target = int(tokens[1])
    nums = [int(x) for x in tokens[2:2 + n]]

    total = sum(nums)
    if (total + target) % 2 != 0 or total < abs(target):
        print(0)
        return

    s = (total + target) // 2
    dp = [0] * (s + 1)
    dp[0] = 1

    for num in nums:
        for i in range(s, num - 1, -1):
            dp[i] += dp[i - num]

    print(dp[s])

if __name__ == '__main__':
    solve()
`,
    cpp: `#include <iostream>
#include <vector>
#include <numeric>
#include <cmath>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int n, target;
    if (!(cin >> n >> target)) return 0;

    vector<int> nums(n);
    int total = 0;
    for (int i = 0; i < n; ++i) {
        cin >> nums[i];
        total += nums[i];
    }

    if ((total + target) % 2 != 0 || total < abs(target)) {
        cout << 0 << "\\n";
        return 0;
    }

    int s = (total + target) / 2;
    vector<int> dp(s + 1, 0);
    dp[0] = 1;

    for (int num : nums) {
        for (int i = s; i >= num; --i) {
            dp[i] += dp[i - num];
        }
    }

    cout << dp[s] << "\\n";
    return 0;
}
`,
  },

  'interleaving-string': {
    python: `import sys

def solve():
    tokens = sys.stdin.read().split()
    if len(tokens) < 3:
        return
    s1 = "" if tokens[0] == "empty" else tokens[0]
    s2 = "" if tokens[1] == "empty" else tokens[1]
    s3 = "" if tokens[2] == "empty" else tokens[2]

    if len(s1) + len(s2) != len(s3):
        print("false")
        return

    m, n = len(s1), len(s2)
    dp = [False] * (n + 1)
    dp[0] = True

    for j in range(1, n + 1):
        dp[j] = dp[j - 1] and s2[j - 1] == s3[j - 1]

    for i in range(1, m + 1):
        dp[0] = dp[0] and s1[i - 1] == s3[i - 1]
        for j in range(1, n + 1):
            dp[j] = (dp[j] and s1[i - 1] == s3[i + j - 1]) or (dp[j - 1] and s2[j - 1] == s3[i + j - 1])

    print("true" if dp[n] else "false")

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

    string s1, s2, s3;
    if (!(cin >> s1 >> s2 >> s3)) return 0;

    if (s1 == "empty") s1 = "";
    if (s2 == "empty") s2 = "";
    if (s3 == "empty") s3 = "";

    if (s1.length() + s2.length() != s3.length()) {
        cout << "false\\n";
        return 0;
    }

    int m = s1.length(), n = s2.length();
    vector<bool> dp(n + 1, false);
    dp[0] = true;

    for (int j = 1; j <= n; ++j) {
        dp[j] = dp[j - 1] && (s2[j - 1] == s3[j - 1]);
    }

    for (int i = 1; i <= m; ++i) {
        dp[0] = dp[0] && (s1[i - 1] == s3[i - 1]);
        for (int j = 1; j <= n; ++j) {
            dp[j] = (dp[j] && s1[i - 1] == s3[i + j - 1]) || (dp[j - 1] && s2[j - 1] == s3[i + j - 1]);
        }
    }

    cout << (dp[n] ? "true" : "false") << "\\n";
    return 0;
}
`,
  },

  'longest-increasing-path-in-a-matrix': {
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

    memo = [[0] * n for _ in range(m)]

    def dfs(r, c):
        if memo[r][c] != 0:
            return memo[r][c]

        best = 1
        for dr, dc in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
            nr, nc = r + dr, c + dc
            if 0 <= nr < m and 0 <= nc < n and matrix[nr][nc] > matrix[r][c]:
                best = max(best, 1 + dfs(nr, nc))

        memo[r][c] = best
        return best

    ans = 0
    for r in range(m):
        for c in range(n):
            ans = max(ans, dfs(r, c))

    print(ans)

if __name__ == '__main__':
    solve()
`,
    cpp: `#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

int dfs(int r, int c, const vector<vector<int>>& matrix, vector<vector<int>>& memo, int m, int n) {
    if (memo[r][c] != 0) return memo[r][c];

    int best = 1;
    int dr[4] = {-1, 1, 0, 0};
    int dc[4] = {0, 0, -1, 1};

    for (int d = 0; d < 4; ++d) {
        int nr = r + dr[d];
        int nc = c + dc[d];
        if (nr >= 0 && nr < m && nc >= 0 && nc < n && matrix[nr][nc] > matrix[r][c]) {
            best = max(best, 1 + dfs(nr, nc, matrix, memo, m, n));
        }
    }

    return memo[r][c] = best;
}

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

    vector<vector<int>> memo(m, vector<int>(n, 0));
    int ans = 0;

    for (int r = 0; r < m; ++r) {
        for (int c = 0; c < n; ++c) {
            ans = max(ans, dfs(r, c, matrix, memo, m, n));
        }
    }

    cout << ans << "\\n";
    return 0;
}
`,
  },

  'distinct-subsequences': {
    python: `import sys

def solve():
    tokens = sys.stdin.read().split()
    if len(tokens) < 2:
        return
    s, t = tokens[0], tokens[1]
    m, n = len(s), len(t)

    dp = [0] * (n + 1)
    dp[0] = 1

    for c in s:
        for j in range(n, 0, -1):
            if c == t[j - 1]:
                dp[j] += dp[j - 1]

    print(dp[n])

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

    string s, t;
    if (!(cin >> s >> t)) return 0;

    int n = t.length();
    vector<unsigned long long> dp(n + 1, 0);
    dp[0] = 1;

    for (char c : s) {
        for (int j = n; j >= 1; --j) {
            if (c == t[j - 1]) {
                dp[j] += dp[j - 1];
            }
        }
    }

    cout << dp[n] << "\\n";
    return 0;
}
`,
  },

  'edit-distance': {
    python: `import sys

def solve():
    tokens = sys.stdin.read().split()
    if len(tokens) < 2:
        print(0)
        return
    w1 = "" if tokens[0] == "empty" else tokens[0]
    w2 = "" if tokens[1] == "empty" else tokens[1]

    m, n = len(w1), len(w2)
    dp = list(range(n + 1))

    for i in range(1, m + 1):
        prev = dp[0]
        dp[0] = i
        for j in range(1, n + 1):
            temp = dp[j]
            if w1[i - 1] == w2[j - 1]:
                dp[j] = prev
            else:
                dp[j] = 1 + min(prev, dp[j], dp[j - 1])
            prev = temp

    print(dp[n])

if __name__ == '__main__':
    solve()
`,
    cpp: `#include <iostream>
#include <string>
#include <vector>
#include <algorithm>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    string w1, w2;
    if (!(cin >> w1 >> w2)) return 0;

    if (w1 == "empty") w1 = "";
    if (w2 == "empty") w2 = "";

    int m = w1.length(), n = w2.length();
    vector<int> dp(n + 1);
    for (int j = 0; j <= n; ++j) dp[j] = j;

    for (int i = 1; i <= m; ++i) {
        int prev = dp[0];
        dp[0] = i;
        for (int j = 1; j <= n; ++j) {
            int temp = dp[j];
            if (w1[i - 1] == w2[j - 1]) {
                dp[j] = prev;
            } else {
                dp[j] = 1 + min({prev, dp[j], dp[j - 1]});
            }
            prev = temp;
        }
    }

    cout << dp[n] << "\\n";
    return 0;
}
`,
  },

  'burst-balloons': {
    python: `import sys

def solve():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    n = int(tokens[0])
    nums = [1] + [int(x) for x in tokens[1:1 + n]] + [1]

    dp = [[0] * (n + 2) for _ in range(n + 2)]

    for length in range(1, n + 1):
        for l in range(1, n - length + 2):
            r = l + length - 1
            for k in range(l, r + 1):
                coins = nums[l - 1] * nums[k] * nums[r + 1] + dp[l][k - 1] + dp[k + 1][r]
                if coins > dp[l][r]:
                    dp[l][r] = coins

    print(dp[1][n])

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

    vector<int> nums(n + 2, 1);
    for (int i = 1; i <= n; ++i) cin >> nums[i];

    vector<vector<int>> dp(n + 2, vector<int>(n + 2, 0));

    for (int len = 1; len <= n; ++len) {
        for (int l = 1; l <= n - len + 1; ++l) {
            int r = l + len - 1;
            for (int k = l; k <= r; ++k) {
                int coins = nums[l - 1] * nums[k] * nums[r + 1] + dp[l][k - 1] + dp[k + 1][r];
                if (coins > dp[l][r]) {
                    dp[l][r] = coins;
                }
            }
        }
    }

    cout << dp[1][n] << "\\n";
    return 0;
}
`,
  },

  'regular-expression-matching': {
    python: `import sys

def solve():
    tokens = sys.stdin.read().split()
    if len(tokens) < 2:
        print("true")
        return
    s = "" if tokens[0] == "empty" else tokens[0]
    p = "" if tokens[1] == "empty" else tokens[1]

    m, n = len(s), len(p)
    dp = [[False] * (n + 1) for _ in range(m + 1)]
    dp[0][0] = True

    for j in range(2, n + 1):
        if p[j - 1] == '*':
            dp[0][j] = dp[0][j - 2]

    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if p[j - 1] == '*':
                # match 0 of preceding
                dp[i][j] = dp[i][j - 2]
                # match 1+ of preceding
                if p[j - 2] == '.' or p[j - 2] == s[i - 1]:
                    dp[i][j] = dp[i][j] or dp[i - 1][j]
            elif p[j - 1] == '.' or p[j - 1] == s[i - 1]:
                dp[i][j] = dp[i - 1][j - 1]

    print("true" if dp[m][n] else "false")

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

    string s, p;
    if (!(cin >> s >> p)) return 0;

    if (s == "empty") s = "";
    if (p == "empty") p = "";

    int m = s.length(), n = p.length();
    vector<vector<bool>> dp(m + 1, vector<bool>(n + 1, false));
    dp[0][0] = true;

    for (int j = 2; j <= n; ++j) {
        if (p[j - 1] == '*') {
            dp[0][j] = dp[0][j - 2];
        }
    }

    for (int i = 1; i <= m; ++i) {
        for (int j = 1; j <= n; ++j) {
            if (p[j - 1] == '*') {
                dp[i][j] = dp[i][j - 2];
                if (p[j - 2] == '.' || p[j - 2] == s[i - 1]) {
                    dp[i][j] = dp[i][j] || dp[i - 1][j];
                }
            } else if (p[j - 1] == '.' || p[j - 1] == s[i - 1]) {
                dp[i][j] = dp[i - 1][j - 1];
            }
        }
    }

    cout << (dp[m][n] ? "true" : "false") << "\\n";
    return 0;
}
`,
  },
};
