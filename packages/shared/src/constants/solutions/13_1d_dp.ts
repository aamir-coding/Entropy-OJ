import { IProblemModelSolutions } from './types';

export const ONE_D_DP_SOLUTIONS: Record<string, IProblemModelSolutions> = {
  'climbing-stairs': {
    python: `import sys

def solve():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    n = int(tokens[0])
    if n <= 2:
        print(n)
        return

    a, b = 1, 2
    for _ in range(3, n + 1):
        a, b = b, a + b

    print(b)

if __name__ == '__main__':
    solve()
`,
    cpp: `#include <iostream>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int n;
    if (!(cin >> n)) return 0;
    if (n <= 2) {
        cout << n << "\\n";
        return 0;
    }

    long long a = 1, b = 2;
    for (int i = 3; i <= n; ++i) {
        long long c = a + b;
        a = b;
        b = c;
    }

    cout << b << "\\n";
    return 0;
}
`,
  },

  'min-cost-climbing-stairs': {
    python: `import sys

def solve():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    n = int(tokens[0])
    cost = [int(x) for x in tokens[1:1 + n]]

    first, second = 0, 0
    for i in range(2, n + 1):
        curr = min(first + cost[i - 2], second + cost[i - 1])
        first = second
        second = curr

    print(second)

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

    vector<int> cost(n);
    for (int i = 0; i < n; ++i) cin >> cost[i];

    int first = 0, second = 0;
    for (int i = 2; i <= n; ++i) {
        int curr = min(first + cost[i - 2], second + cost[i - 1]);
        first = second;
        second = curr;
    }

    cout << second << "\\n";
    return 0;
}
`,
  },

  'house-robber': {
    python: `import sys

def solve():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    n = int(tokens[0])
    nums = [int(x) for x in tokens[1:1 + n]]

    rob1, rob2 = 0, 0
    for n in nums:
        new_rob = max(rob2, rob1 + n)
        rob1 = rob2
        rob2 = new_rob

    print(rob2)

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

    long long rob1 = 0, rob2 = 0;
    for (int i = 0; i < n; ++i) {
        long long val;
        cin >> val;
        long long newRob = max(rob2, rob1 + val);
        rob1 = rob2;
        rob2 = newRob;
    }

    cout << rob2 << "\\n";
    return 0;
}
`,
  },

  'house-robber-ii': {
    python: `import sys

def rob_simple(nums):
    rob1, rob2 = 0, 0
    for n in nums:
        new_rob = max(rob2, rob1 + n)
        rob1 = rob2
        rob2 = new_rob
    return rob2

def solve():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    n = int(tokens[0])
    nums = [int(x) for x in tokens[1:1 + n]]

    if n == 1:
        print(nums[0])
        return

    print(max(rob_simple(nums[:-1]), rob_simple(nums[1:])))

if __name__ == '__main__':
    solve()
`,
    cpp: `#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

long long robSimple(const vector<long long>& nums, int start, int end) {
    long long rob1 = 0, rob2 = 0;
    for (int i = start; i <= end; ++i) {
        long long newRob = max(rob2, rob1 + nums[i]);
        rob1 = rob2;
        rob2 = newRob;
    }
    return rob2;
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int n;
    if (!(cin >> n)) return 0;

    vector<long long> nums(n);
    for (int i = 0; i < n; ++i) cin >> nums[i];

    if (n == 1) {
        cout << nums[0] << "\\n";
        return 0;
    }

    cout << max(robSimple(nums, 0, n - 2), robSimple(nums, 1, n - 1)) << "\\n";
    return 0;
}
`,
  },

  'longest-palindromic-substring': {
    python: `import sys

def solve():
    s = sys.stdin.read().strip()
    if not s:
        return

    n = len(s)
    start = 0
    max_len = 1

    def expand(l, r):
        nonlocal start, max_len
        while l >= 0 and r < n and s[l] == s[r]:
            curr_len = r - l + 1
            if curr_len > max_len:
                max_len = curr_len
                start = l
            l -= 1
            r += 1

    for i in range(n):
        expand(i, i)     # Odd length
        expand(i, i + 1) # Even length

    print(s[start:start + max_len])

if __name__ == '__main__':
    solve()
`,
    cpp: `#include <iostream>
#include <string>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    string s;
    if (!(cin >> s) || s.empty()) return 0;

    int n = s.length();
    int start = 0, maxLen = 1;

    auto expand = [&](int l, int r) {
        while (l >= 0 && r < n && s[l] == s[r]) {
            int currLen = r - l + 1;
            if (currLen > maxLen) {
                maxLen = currLen;
                start = l;
            }
            l--;
            r++;
        }
    };

    for (int i = 0; i < n; ++i) {
        expand(i, i);
        expand(i, i + 1);
    }

    cout << s.substr(start, maxLen) << "\\n";
    return 0;
}
`,
  },

  'palindromic-substrings': {
    python: `import sys

def solve():
    s = sys.stdin.read().strip()
    if not s:
        print(0)
        return

    n = len(s)
    count = 0

    def expand(l, r):
        nonlocal count
        while l >= 0 and r < n and s[l] == s[r]:
            count += 1
            l -= 1
            r += 1

    for i in range(n):
        expand(i, i)
        expand(i, i + 1)

    print(count)

if __name__ == '__main__':
    solve()
`,
    cpp: `#include <iostream>
#include <string>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    string s;
    if (!(cin >> s) || s.empty()) {
        cout << 0 << "\\n";
        return 0;
    }

    int n = s.length();
    int count = 0;

    auto expand = [&](int l, int r) {
        while (l >= 0 && r < n && s[l] == s[r]) {
            count++;
            l--;
            r++;
        }
    };

    for (int i = 0; i < n; ++i) {
        expand(i, i);
        expand(i, i + 1);
    }

    cout << count << "\\n";
    return 0;
}
`,
  },

  'decode-ways': {
    python: `import sys

def solve():
    s = sys.stdin.read().strip()
    if not s or s[0] == '0':
        print(0)
        return

    n = len(s)
    dp = [0] * (n + 1)
    dp[0] = 1
    dp[1] = 1

    for i in range(2, n + 1):
        one = int(s[i - 1:i])
        two = int(s[i - 2:i])

        if 1 <= one <= 9:
            dp[i] += dp[i - 1]
        if 10 <= two <= 26:
            dp[i] += dp[i - 2]

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

    string s;
    if (!(cin >> s) || s.empty() || s[0] == '0') {
        cout << 0 << "\\n";
        return 0;
    }

    int n = s.length();
    vector<long long> dp(n + 1, 0);
    dp[0] = 1;
    dp[1] = 1;

    for (int i = 2; i <= n; ++i) {
        int one = s[i - 1] - '0';
        int two = (s[i - 2] - '0') * 10 + one;

        if (one >= 1 && one <= 9) dp[i] += dp[i - 1];
        if (two >= 10 && two <= 26) dp[i] += dp[i - 2];
    }

    cout << dp[n] << "\\n";
    return 0;
}
`,
  },

  'coin-change': {
    python: `import sys

def solve():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    n = int(tokens[0])
    amount = int(tokens[1])
    coins = [int(x) for x in tokens[2:2 + n]]

    dp = [float('inf')] * (amount + 1)
    dp[0] = 0

    for c in coins:
        for i in range(c, amount + 1):
            if dp[i - c] != float('inf'):
                dp[i] = min(dp[i], dp[i - c] + 1)

    print(dp[amount] if dp[amount] != float('inf') else -1)

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

    int n, amount;
    if (!(cin >> n >> amount)) return 0;

    vector<int> coins(n);
    for (int i = 0; i < n; ++i) cin >> coins[i];

    const int INF = 1e9;
    vector<int> dp(amount + 1, INF);
    dp[0] = 0;

    for (int c : coins) {
        for (int i = c; i <= amount; ++i) {
            if (dp[i - c] != INF) {
                dp[i] = min(dp[i], dp[i - c] + 1);
            }
        }
    }

    cout << (dp[amount] == INF ? -1 : dp[amount]) << "\\n";
    return 0;
}
`,
  },

  'maximum-product-subarray': {
    python: `import sys

def solve():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    n = int(tokens[0])
    nums = [int(x) for x in tokens[1:1 + n]]

    res = nums[0]
    cur_min, cur_max = 1, 1

    for num in nums:
        vals = (num, num * cur_max, num * cur_min)
        cur_max = max(vals)
        cur_min = min(vals)
        res = max(res, cur_max)

    print(res)

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

    vector<long long> nums(n);
    for (int i = 0; i < n; ++i) cin >> nums[i];

    long long res = nums[0];
    long long curMin = 1, curMax = 1;

    for (long long num : nums) {
        long long c1 = num * curMax;
        long long c2 = num * curMin;
        curMax = max({num, c1, c2});
        curMin = min({num, c1, c2});
        res = max(res, curMax);
    }

    cout << res << "\\n";
    return 0;
}
`,
  },

  'word-break': {
    python: `import sys

def solve():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    s = tokens[0]
    n = int(tokens[1])
    words = tokens[2:2 + n]

    dp = [False] * (len(s) + 1)
    dp[0] = True

    for i in range(1, len(s) + 1):
        for w in words:
            if i >= len(w) and dp[i - len(w)] and s[i - len(w):i] == w:
                dp[i] = True
                break

    print("true" if dp[len(s)] else "false")

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

    string s;
    int n;
    if (!(cin >> s >> n)) return 0;

    vector<string> words(n);
    for (int i = 0; i < n; ++i) cin >> words[i];

    int len = s.length();
    vector<bool> dp(len + 1, false);
    dp[0] = true;

    for (int i = 1; i <= len; ++i) {
        for (const string& w : words) {
            int wlen = w.length();
            if (i >= wlen && dp[i - wlen] && s.substr(i - wlen, wlen) == w) {
                dp[i] = true;
                break;
            }
        }
    }

    cout << (dp[len] ? "true" : "false") << "\\n";
    return 0;
}
`,
  },

  'longest-increasing-subsequence': {
    python: `import sys
import bisect

def solve():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    n = int(tokens[0])
    nums = [int(x) for x in tokens[1:1 + n]]

    tails = []
    for x in nums:
        idx = bisect.bisect_left(tails, x)
        if idx == len(tails):
            tails.append(x)
        else:
            tails[idx] = x

    print(len(tails))

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

    vector<int> nums(n);
    for (int i = 0; i < n; ++i) cin >> nums[i];

    vector<int> tails;
    for (int x : nums) {
        auto it = lower_bound(tails.begin(), tails.end(), x);
        if (it == tails.end()) {
            tails.push_back(x);
        } else {
            *it = x;
        }
    }

    cout << tails.size() << "\\n";
    return 0;
}
`,
  },

  'partition-equal-subset-sum': {
    python: `import sys

def solve():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    n = int(tokens[0])
    nums = [int(x) for x in tokens[1:1 + n]]

    total = sum(nums)
    if total % 2 != 0:
        print("false")
        return

    target = total // 2
    dp = 1 # bitmask for reachable sums

    for num in nums:
        dp |= (dp << num)

    print("true" if (dp & (1 << target)) else "false")

if __name__ == '__main__':
    solve()
`,
    cpp: `#include <iostream>
#include <vector>
#include <numeric>
#include <bitset>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int n;
    if (!(cin >> n)) return 0;

    vector<int> nums(n);
    int total = 0;
    for (int i = 0; i < n; ++i) {
        cin >> nums[i];
        total += nums[i];
    }

    if (total % 2 != 0) {
        cout << "false\\n";
        return 0;
    }

    int target = total / 2;
    bitset<10001> dp;
    dp[0] = 1;

    for (int x : nums) {
        dp |= (dp << x);
    }

    cout << (dp[target] ? "true" : "false") << "\\n";
    return 0;
}
`,
  },
};
