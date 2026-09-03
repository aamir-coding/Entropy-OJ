import { SupportedLanguage, SupportedLanguages, LANGUAGE_CONFIGS } from './languages';

export type IProblemModelSolutions = Record<SupportedLanguage, string>;

const rawModelSolutions: Record<string, IProblemModelSolutions> = {
  // ─── EASY PROBLEMS (1 - 12) ────────────────────────────────────────────────

  'two-sum': {
    python: `import sys

def solve():
    raw = sys.stdin.read().split()
    if not raw:
        return
    n = int(raw[0])
    target = int(raw[1])
    nums = [int(x) for x in raw[2:2 + n]]
    
    seen = {}
    for i, num in enumerate(nums):
        diff = target - num
        if diff in seen:
            first, second = sorted([seen[diff], i])
            print(f"{first} {second}")
            return
        seen[num] = i

if __name__ == '__main__':
    solve()
`,
    cpp: `#include <iostream>
#include <vector>
#include <unordered_map>
#include <algorithm>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int n;
    long long target;
    if (!(cin >> n >> target)) return 0;

    vector<long long> nums(n);
    for (int i = 0; i < n; ++i) {
        cin >> nums[i];
    }

    unordered_map<long long, int> seen;
    for (int i = 0; i < n; ++i) {
        long long diff = target - nums[i];
        if (seen.find(diff) != seen.end()) {
            int first = seen[diff];
            int second = i;
            if (first > second) swap(first, second);
            cout << first << " " << second << "\\n";
            return 0;
        }
        seen[nums[i]] = i;
    }

    return 0;
}
`,
  },

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
#include <vector>
#include <stack>

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
            if (c == ')' && top != '(') return false;
            if (c == '}' && top != '{') return false;
            if (c == ']' && top != '[') return false;
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
        cin >> s;
        cout << (isValid(s) ? "true" : "false") << "\\n";
    }

    return 0;
}
`,
  },

  'reverse-array': {
    python: `import sys

def solve():
    raw = sys.stdin.read().split()
    if not raw:
        return
    n = int(raw[0])
    nums = raw[1:1 + n]
    nums.reverse()
    print(" ".join(nums))

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

    vector<long long> a(n);
    for (int i = 0; i < n; ++i) {
        cin >> a[i];
    }

    reverse(a.begin(), a.end());

    for (int i = 0; i < n; ++i) {
        cout << a[i] << (i + 1 == n ? "" : " ");
    }
    cout << "\\n";

    return 0;
}
`,
  },

  'best-time-to-buy-and-sell-stock': {
    python: `import sys

def solve():
    raw = sys.stdin.read().split()
    if not raw:
        return
    n = int(raw[0])
    prices = [int(x) for x in raw[1:1 + n]]
    
    if n <= 1:
        print(0)
        return
        
    min_price = prices[0]
    max_profit = 0
    for price in prices[1:]:
        if price < min_price:
            min_price = price
        elif price - min_price > max_profit:
            max_profit = price - min_price
            
    print(max_profit)

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
    if (!(cin >> n) || n <= 0) {
        cout << 0 << "\\n";
        return 0;
    }

    long long min_price, x;
    cin >> min_price;
    long long max_profit = 0;

    for (int i = 1; i < n; ++i) {
        cin >> x;
        if (x < min_price) {
            min_price = x;
        } else {
            max_profit = max(max_profit, x - min_price);
        }
    }

    cout << max_profit << "\\n";
    return 0;
}
`,
  },

  'binary-search': {
    python: `import sys

def solve():
    raw = sys.stdin.read().split()
    if not raw:
        return
    n = int(raw[0])
    target = int(raw[1])
    nums = [int(x) for x in raw[2:2 + n]]
    
    low, high = 0, n - 1
    ans = -1
    while low <= high:
        mid = (low + high) // 2
        if nums[mid] == target:
            ans = mid
            break
        elif nums[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
            
    print(ans)

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
    long long target;
    if (!(cin >> n >> target)) return 0;

    vector<long long> nums(n);
    for (int i = 0; i < n; ++i) cin >> nums[i];

    int low = 0, high = n - 1, ans = -1;
    while (low <= high) {
        int mid = low + (high - low) / 2;
        if (nums[mid] == target) {
            ans = mid;
            break;
        } else if (nums[mid] < target) {
            low = mid + 1;
        } else {
            high = mid - 1;
        }
    }

    cout << ans << "\\n";
    return 0;
}
`,
  },

  'climbing-stairs': {
    python: `import sys

def solve():
    raw = sys.stdin.read().split()
    if not raw:
        return
    n = int(raw[0])
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
        long long next = a + b;
        a = b;
        b = next;
    }

    cout << b << "\\n";
    return 0;
}
`,
  },

  'contains-duplicate': {
    python: `import sys

def solve():
    raw = sys.stdin.read().split()
    if not raw:
        return
    n = int(raw[0])
    nums = raw[1:1 + n]
    seen = set()
    for x in nums:
        if x in seen:
            print("true")
            return
        seen.add(x)
    print("false")

if __name__ == '__main__':
    solve()
`,
    cpp: `#include <iostream>
#include <vector>
#include <unordered_set>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int n;
    if (!(cin >> n)) return 0;

    unordered_set<long long> seen;
    bool hasDuplicate = false;
    for (int i = 0; i < n; ++i) {
        long long x;
        cin >> x;
        if (!hasDuplicate) {
            if (seen.find(x) != seen.end()) {
                hasDuplicate = true;
            } else {
                seen.insert(x);
            }
        }
    }

    cout << (hasDuplicate ? "true" : "false") << "\\n";
    return 0;
}
`,
  },

  'valid-anagram': {
    python: `import sys

def solve():
    lines = sys.stdin.read().split()
    if len(lines) < 2:
        return
    s1, s2 = lines[0], lines[1]
    if len(s1) != len(s2):
        print("false")
        return
    print("true" if sorted(s1) == sorted(s2) else "false")

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

    if (s.length() != t.length()) {
        cout << "false\\n";
        return 0;
    }

    vector<int> count(26, 0);
    for (char c : s) count[c - 'a']++;
    for (char c : t) {
        if (--count[c - 'a'] < 0) {
            cout << "false\\n";
            return 0;
        }
    }

    cout << "true\\n";
    return 0;
}
`,
  },

  'single-number': {
    python: `import sys

def solve():
    raw = sys.stdin.read().split()
    if not raw:
        return
    n = int(raw[0])
    res = 0
    for x in raw[1:1 + n]:
        res ^= int(x)
    print(res)

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

    long long res = 0;
    for (int i = 0; i < n; ++i) {
        long long x;
        cin >> x;
        res ^= x;
    }

    cout << res << "\\n";
    return 0;
}
`,
  },

  'palindrome-number': {
    python: `import sys

def solve():
    raw = sys.stdin.read().split()
    if not raw:
        return
    s = raw[0]
    print("true" if s == s[::-1] else "false")

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
    if (!(cin >> s)) return 0;

    int l = 0, r = (int)s.length() - 1;
    bool isPal = true;
    while (l < r) {
        if (s[l] != s[r]) {
            isPal = false;
            break;
        }
        l++;
        r--;
    }

    cout << (isPal ? "true" : "false") << "\\n";
    return 0;
}
`,
  },

  'merge-two-sorted-arrays': {
    python: `import sys

def solve():
    raw = sys.stdin.read().split()
    if not raw:
        return
    n, m = int(raw[0]), int(raw[1])
    idx = 2
    a = [int(x) for x in raw[idx:idx + n]]
    idx += n
    b = [int(x) for x in raw[idx:idx + m]]
    
    merged = []
    i, j = 0, 0
    while i < n and j < m:
        if a[i] <= b[j]:
            merged.append(str(a[i]))
            i += 1
        else:
            merged.append(str(b[j]))
            j += 1
    while i < n:
        merged.append(str(a[i]))
        i += 1
    while j < m:
        merged.append(str(b[j]))
        j += 1
        
    print(" ".join(merged))

if __name__ == '__main__':
    solve()
`,
    cpp: `#include <iostream>
#include <vector>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int n, m;
    if (!(cin >> n >> m)) return 0;

    vector<long long> a(n), b(m);
    for (int i = 0; i < n; ++i) cin >> a[i];
    for (int j = 0; j < m; ++j) cin >> b[j];

    int i = 0, j = 0;
    bool first = true;
    while (i < n && j < m) {
        if (!first) cout << " ";
        first = false;
        if (a[i] <= b[j]) {
            cout << a[i++];
        } else {
            cout << b[j++];
        }
    }
    while (i < n) {
        if (!first) cout << " ";
        first = false;
        cout << a[i++];
    }
    while (j < m) {
        if (!first) cout << " ";
        first = false;
        cout << b[j++];
    }
    cout << "\\n";

    return 0;
}
`,
  },

  'fizz-buzz-extended': {
    python: `import sys

def solve():
    raw = sys.stdin.read().split()
    if not raw:
        return
    n = int(raw[0])
    lines = []
    for i in range(1, n + 1):
        if i % 15 == 0:
            lines.append("FizzBuzz")
        elif i % 3 == 0:
            lines.append("Fizz")
        elif i % 5 == 0:
            lines.append("Buzz")
        else:
            lines.append(str(i))
    print('\\n'.join(lines))

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

    for (int i = 1; i <= n; ++i) {
        if (i % 15 == 0) cout << "FizzBuzz\\n";
        else if (i % 3 == 0) cout << "Fizz\\n";
        else if (i % 5 == 0) cout << "Buzz\\n";
        else cout << i << "\\n";
    }

    return 0;
}
`,
  },

  // ─── MEDIUM PROBLEMS (13 - 22) ─────────────────────────────────────────────

  'maximum-subarray': {
    python: `import sys

def solve():
    raw = sys.stdin.read().split()
    if not raw:
        return
    n = int(raw[0])
    nums = [int(x) for x in raw[1:1 + n]]
    if not nums:
        print(0)
        return
    current_sum = max_sum = nums[0]
    for x in nums[1:]:
        current_sum = max(x, current_sum + x)
        max_sum = max(max_sum, current_sum)
    print(max_sum)

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
    if (!(cin >> n) || n <= 0) return 0;

    long long first;
    cin >> first;
    long long current_sum = first, max_sum = first;

    for (int i = 1; i < n; ++i) {
        long long x;
        cin >> x;
        current_sum = max(x, current_sum + x);
        max_sum = max(max_sum, current_sum);
    }

    cout << max_sum << "\\n";
    return 0;
}
`,
  },

  'longest-unique-substring': {
    python: `import sys

def solve():
    s = sys.stdin.read().strip()
    if not s:
        print(0)
        return
    seen = {}
    left = 0
    max_len = 0
    for right, char in enumerate(s):
        if char in seen and seen[char] >= left:
            left = seen[char] + 1
        seen[char] = right
        max_len = max(max_len, right - left + 1)
    print(max_len)

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

    string s;
    if (!(getline(cin, s))) {
        cout << 0 << "\\n";
        return 0;
    }

    vector<int> last(256, -1);
    int left = 0, max_len = 0;

    for (int right = 0; right < (int)s.length(); ++right) {
        unsigned char c = s[right];
        if (last[c] >= left) {
            left = last[c] + 1;
        }
        last[c] = right;
        max_len = max(max_len, right - left + 1);
    }

    cout << max_len << "\\n";
    return 0;
}
`,
  },

  'container-with-most-water': {
    python: `import sys

def solve():
    raw = sys.stdin.read().split()
    if not raw:
        return
    n = int(raw[0])
    h = [int(x) for x in raw[1:1 + n]]
    
    left, right = 0, n - 1
    max_area = 0
    while left < right:
        width = right - left
        area = min(h[left], h[right]) * width
        if area > max_area:
            max_area = area
        if h[left] < h[right]:
            left += 1
        else:
            right -= 1
            
    print(max_area)

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

    vector<long long> h(n);
    for (int i = 0; i < n; ++i) cin >> h[i];

    int left = 0, right = n - 1;
    long long max_area = 0;

    while (left < right) {
        long long current_area = min(h[left], h[right]) * (right - left);
        max_area = max(max_area, current_area);
        if (h[left] < h[right]) {
            left++;
        } else {
            right--;
        }
    }

    cout << max_area << "\\n";
    return 0;
}
`,
  },

  'three-sum': {
    python: `import sys

def solve():
    raw = sys.stdin.read().split()
    if not raw:
        return
    n = int(raw[0])
    nums = sorted([int(x) for x in raw[1:1 + n]])
    
    count = 0
    for i in range(n - 2):
        if i > 0 and nums[i] == nums[i - 1]:
            continue
        left, right = i + 1, n - 1
        while left < right:
            total = nums[i] + nums[left] + nums[right]
            if total == 0:
                count += 1
                while left < right and nums[left] == nums[left + 1]:
                    left += 1
                while left < right and nums[right] == nums[right - 1]:
                    right -= 1
                left += 1
                right -= 1
            elif total < 0:
                left += 1
            else:
                right -= 1
    print(count)

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
    if (!(cin >> n) || n < 3) {
        cout << 0 << "\\n";
        return 0;
    }

    vector<long long> nums(n);
    for (int i = 0; i < n; ++i) cin >> nums[i];
    sort(nums.begin(), nums.end());

    long long count = 0;
    for (int i = 0; i < n - 2; ++i) {
        if (i > 0 && nums[i] == nums[i - 1]) continue;
        int left = i + 1, right = n - 1;
        while (left < right) {
            long long total = nums[i] + nums[left] + nums[right];
            if (total == 0) {
                count++;
                while (left < right && nums[left] == nums[left + 1]) left++;
                while (left < right && nums[right] == nums[right - 1]) right--;
                left++;
                right--;
            } else if (total < 0) {
                left++;
            } else {
                right--;
            }
        }
    }

    cout << count << "\\n";
    return 0;
}
`,
  },

  'coin-change': {
    python: `import sys

def solve():
    raw = sys.stdin.read().split()
    if not raw:
        return
    n, amount = int(raw[0]), int(raw[1])
    coins = [int(x) for x in raw[2:2 + n]]
    
    dp = [float('inf')] * (amount + 1)
    dp[0] = 0
    for coin in coins:
        for x in range(coin, amount + 1):
            if dp[x - coin] + 1 < dp[x]:
                dp[x] = dp[x - coin] + 1
                
    print(dp[amount] if dp[amount] != float('inf') else -1)

if __name__ == '__main__':
    solve()
`,
    cpp: `#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

const int INF = 1e9;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int n, amount;
    if (!(cin >> n >> amount)) return 0;

    vector<int> coins(n);
    for (int i = 0; i < n; ++i) cin >> coins[i];

    vector<int> dp(amount + 1, INF);
    dp[0] = 0;

    for (int coin : coins) {
        for (int x = coin; x <= amount; ++x) {
            dp[x] = min(dp[x], dp[x - coin] + 1);
        }
    }

    cout << (dp[amount] >= INF ? -1 : dp[amount]) << "\\n";
    return 0;
}
`,
  },

  'longest-increasing-subsequence': {
    python: `import sys
from bisect import bisect_left

def solve():
    raw = sys.stdin.read().split()
    if not raw:
        return
    n = int(raw[0])
    nums = [int(x) for x in raw[1:1 + n]]
    
    tails = []
    for x in nums:
        idx = bisect_left(tails, x)
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
    if (!(cin >> n) || n <= 0) {
        cout << 0 << "\\n";
        return 0;
    }

    vector<long long> tails;
    for (int i = 0; i < n; ++i) {
        long long x;
        cin >> x;
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

  'number-of-islands': {
    python: `import sys
from collections import deque

def solve():
    raw = sys.stdin.read().split()
    if not raw:
        return
    r, c = int(raw[0]), int(raw[1])
    grid = [list(raw[2 + i]) for i in range(r)]
    
    islands = 0
    for i in range(r):
        for j in range(c):
            if grid[i][j] == '1':
                islands += 1
                q = deque([(i, j)])
                grid[i][j] = '0'
                while q:
                    cr, cc = q.popleft()
                    for dr, dc in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                        nr, nc = cr + dr, cc + dc
                        if 0 <= nr < r and 0 <= nc < c and grid[nr][nc] == '1':
                            grid[nr][nc] = '0'
                            q.append((nr, nc))
    print(islands)

if __name__ == '__main__':
    solve()
`,
    cpp: `#include <iostream>
#include <vector>
#include <string>
#include <queue>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int r, c;
    if (!(cin >> r >> c)) return 0;

    vector<string> grid(r);
    for (int i = 0; i < r; ++i) cin >> grid[i];

    int islands = 0;
    int dr[] = {-1, 1, 0, 0};
    int dc[] = {0, 0, -1, 1};

    for (int i = 0; i < r; ++i) {
        for (int j = 0; j < c; ++j) {
            if (grid[i][j] == '1') {
                islands++;
                grid[i][j] = '0';
                queue<pair<int, int>> q;
                q.push({i, j});
                while (!q.empty()) {
                    auto [cr, cc] = q.front();
                    q.pop();
                    for (int d = 0; d < 4; ++d) {
                        int nr = cr + dr[d];
                        int nc = cc + dc[d];
                        if (nr >= 0 && nr < r && nc >= 0 && nc < c && grid[nr][nc] == '1') {
                            grid[nr][nc] = '0';
                            q.push({nr, nc});
                        }
                    }
                }
            }
        }
    }

    cout << islands << "\\n";
    return 0;
}
`,
  },

  'kth-largest-element': {
    python: `import sys
import heapq

def solve():
    raw = sys.stdin.read().split()
    if not raw:
        return
    n, k = int(raw[0]), int(raw[1])
    nums = [int(x) for x in raw[2:2 + n]]
    
    # Min-heap of size k
    heap = []
    for x in nums:
        heapq.heappush(heap, x)
        if len(heap) > k:
            heapq.heappop(heap)
            
    print(heap[0])

if __name__ == '__main__':
    solve()
`,
    cpp: `#include <iostream>
#include <vector>
#include <queue>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int n, k;
    if (!(cin >> n >> k)) return 0;

    priority_queue<long long, vector<long long>, greater<long long>> pq;
    for (int i = 0; i < n; ++i) {
        long long x;
        cin >> x;
        pq.push(x);
        if ((int)pq.size() > k) {
            pq.pop();
        }
    }

    cout << pq.top() << "\\n";
    return 0;
}
`,
  },

  'course-schedule': {
    python: `import sys
from collections import deque

def solve():
    raw = sys.stdin.read().split()
    if not raw:
        return
    n, m = int(raw[0]), int(raw[1])
    adj = [[] for _ in range(n)]
    indegree = [0] * n
    
    idx = 2
    for _ in range(m):
        u, v = int(raw[idx]), int(raw[idx + 1])
        adj[v].append(u)
        indegree[u] += 1
        idx += 2
        
    q = deque([i for i in range(n) if indegree[i] == 0])
    visited = 0
    while q:
        curr = q.popleft()
        visited += 1
        for nxt in adj[curr]:
            indegree[nxt] -= 1
            if indegree[nxt] == 0:
                q.append(nxt)
                
    print("true" if visited == n else "false")

if __name__ == '__main__':
    solve()
`,
    cpp: `#include <iostream>
#include <vector>
#include <queue>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int n, m;
    if (!(cin >> n >> m)) return 0;

    vector<vector<int>> adj(n);
    vector<int> indegree(n, 0);

    for (int i = 0; i < m; ++i) {
        int u, v;
        cin >> u >> v;
        adj[v].push_back(u);
        indegree[u]++;
    }

    queue<int> q;
    for (int i = 0; i < n; ++i) {
        if (indegree[i] == 0) q.push(i);
    }

    int visited = 0;
    while (!q.empty()) {
        int curr = q.front();
        q.pop();
        visited++;
        for (int nxt : adj[curr]) {
            if (--indegree[nxt] == 0) {
                q.push(nxt);
            }
        }
    }

    cout << (visited == n ? "true" : "false") << "\\n";
    return 0;
}
`,
  },

  'word-break': {
    python: `import sys

def solve():
    raw = sys.stdin.read().split()
    if not raw:
        return
    s = raw[0]
    k = int(raw[1])
    words = set(raw[2:2 + k])
    
    n = len(s)
    dp = [False] * (n + 1)
    dp[0] = True
    
    max_len = max([len(w) for w in words]) if words else 0
    
    for i in range(1, n + 1):
        for length in range(1, min(i, max_len) + 1):
            if dp[i - length] and s[i - length:i] in words:
                dp[i] = True
                break
                
    print("true" if dp[n] else "false")

if __name__ == '__main__':
    solve()
`,
    cpp: `#include <iostream>
#include <string>
#include <vector>
#include <unordered_set>
#include <algorithm>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    string s;
    int k;
    if (!(cin >> s >> k)) return 0;

    unordered_set<string> dict;
    int max_len = 0;
    for (int i = 0; i < k; ++i) {
        string w;
        cin >> w;
        dict.insert(w);
        max_len = max(max_len, (int)w.length());
    }

    int n = s.length();
    vector<bool> dp(n + 1, false);
    dp[0] = true;

    for (int i = 1; i <= n; ++i) {
        for (int len = 1; len <= min(i, max_len); ++len) {
            if (dp[i - len]) {
                string sub = s.substr(i - len, len);
                if (dict.find(sub) != dict.end()) {
                    dp[i] = true;
                    break;
                }
            }
        }
    }

    cout << (dp[n] ? "true" : "false") << "\\n";
    return 0;
}
`,
  },

  // ─── HARD PROBLEMS (23 - 30) ───────────────────────────────────────────────

  'trapping-rain-water': {
    python: `import sys

def solve():
    raw = sys.stdin.read().split()
    if not raw:
        return
    n = int(raw[0])
    height = [int(x) for x in raw[1:1 + n]]
    if n <= 2:
        print(0)
        return
    left, right = 0, n - 1
    left_max, right_max = height[left], height[right]
    water = 0
    while left < right:
        if left_max < right_max:
            left += 1
            left_max = max(left_max, height[left])
            water += max(0, left_max - height[left])
        else:
            right -= 1
            right_max = max(right_max, height[right])
            water += max(0, right_max - height[right])
    print(water)

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
    if (!(cin >> n) || n <= 2) {
        cout << 0 << "\\n";
        return 0;
    }

    vector<long long> height(n);
    for (int i = 0; i < n; ++i) {
        cin >> height[i];
    }

    int left = 0, right = n - 1;
    long long leftMax = 0, rightMax = 0, water = 0;

    while (left < right) {
        if (height[left] < height[right]) {
            if (height[left] >= leftMax) {
                leftMax = height[left];
            } else {
                water += leftMax - height[left];
            }
            left++;
        } else {
            if (height[right] >= rightMax) {
                rightMax = height[right];
            } else {
                water += rightMax - height[right];
            }
            right--;
        }
    }

    cout << water << "\\n";
    return 0;
}
`,
  },

  'sliding-window-maximum': {
    python: `import sys
from collections import deque

def solve():
    raw = sys.stdin.read().split()
    if not raw:
        return
    n, k = int(raw[0]), int(raw[1])
    nums = [int(x) for x in raw[2:2 + n]]
    
    dq = deque()
    result = []
    
    for i in range(n):
        # Remove elements outside the current window
        if dq and dq[0] < i - k + 1:
            dq.popleft()
        # Maintain decreasing order in deque
        while dq and nums[dq[-1]] < nums[i]:
            dq.pop()
        dq.append(i)
        # Window reached size k
        if i >= k - 1:
            result.append(str(nums[dq[0]]))
            
    print(" ".join(result))

if __name__ == '__main__':
    solve()
`,
    cpp: `#include <iostream>
#include <vector>
#include <deque>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int n, k;
    if (!(cin >> n >> k)) return 0;

    vector<long long> nums(n);
    for (int i = 0; i < n; ++i) cin >> nums[i];

    deque<int> dq;
    bool first = true;

    for (int i = 0; i < n; ++i) {
        if (!dq.empty() && dq.front() < i - k + 1) {
            dq.pop_front();
        }
        while (!dq.empty() && nums[dq.back()] < nums[i]) {
            dq.pop_back();
        }
        dq.push_back(i);

        if (i >= k - 1) {
            if (!first) cout << " ";
            first = false;
            cout << nums[dq.front()];
        }
    }
    cout << "\\n";

    return 0;
}
`,
  },

  'median-of-two-sorted-arrays': {
    python: `import sys

def solve():
    raw = sys.stdin.read().split()
    if not raw:
        return
    n, m = int(raw[0]), int(raw[1])
    idx = 2
    a = [int(x) for x in raw[idx:idx + n]]
    idx += n
    b = [int(x) for x in raw[idx:idx + m]]
    
    if n > m:
        a, b = b, a
        n, m = m, n
        
    low, high = 0, n
    half = (n + m + 1) // 2
    
    while low <= high:
        i = (low + high) // 2
        j = half - i
        
        a_left = float('-inf') if i == 0 else a[i - 1]
        a_right = float('inf') if i == n else a[i]
        b_left = float('-inf') if j == 0 else b[j - 1]
        b_right = float('inf') if j == m else b[j]
        
        if a_left <= b_right and b_left <= a_right:
            if (n + m) % 2 == 1:
                ans = float(max(a_left, b_left))
            else:
                ans = (max(a_left, b_left) + min(a_right, b_right)) / 2.0
            print(f"{ans:.1f}")
            return
        elif a_left > b_right:
            high = i - 1
        else:
            low = i + 1

if __name__ == '__main__':
    solve()
`,
    cpp: `#include <iostream>
#include <vector>
#include <algorithm>
#include <iomanip>

using namespace std;

const long long INF = 1e18;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int n, m;
    if (!(cin >> n >> m)) return 0;

    vector<long long> a(n), b(m);
    for (int i = 0; i < n; ++i) cin >> a[i];
    for (int j = 0; j < m; ++j) cin >> b[j];

    if (n > m) {
        swap(a, b);
        swap(n, m);
    }

    int low = 0, high = n;
    int half = (n + m + 1) / 2;
    double median = 0.0;

    while (low <= high) {
        int i = low + (high - low) / 2;
        int j = half - i;

        long long a_left = (i == 0) ? -INF : a[i - 1];
        long long a_right = (i == n) ? INF : a[i];
        long long b_left = (j == 0) ? -INF : b[j - 1];
        long long b_right = (j == m) ? INF : b[j];

        if (a_left <= b_right && b_left <= a_right) {
            if ((n + m) % 2 == 1) {
                median = max(a_left, b_left);
            } else {
                median = (max(a_left, b_left) + min(a_right, b_right)) / 2.0;
            }
            break;
        } else if (a_left > b_right) {
            high = i - 1;
        } else {
            low = i + 1;
        }
    }

    cout << fixed << setprecision(1) << median << "\\n";
    return 0;
}
`,
  },

  'edit-distance': {
    python: `import sys

def solve():
    lines = sys.stdin.read().split()
    if not lines:
        print(0)
        return
    s1 = lines[0] if len(lines) >= 1 else ""
    s2 = lines[1] if len(lines) >= 2 else ""
    
    m, n = len(s1), len(s2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    
    for i in range(m + 1):
        dp[i][0] = i
    for j in range(n + 1):
        dp[0][j] = j
        
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if s1[i - 1] == s2[j - 1]:
                dp[i][j] = dp[i - 1][j - 1]
            else:
                dp[i][j] = 1 + min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
                
    print(dp[m][n])

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
    if (!(cin >> s1)) s1 = "";
    if (!(cin >> s2)) s2 = "";

    int m = s1.length(), n = s2.length();
    vector<vector<int>> dp(m + 1, vector<int>(n + 1, 0));

    for (int i = 0; i <= m; ++i) dp[i][0] = i;
    for (int j = 0; j <= n; ++j) dp[0][j] = j;

    for (int i = 1; i <= m; ++i) {
        for (int j = 1; j <= n; ++j) {
            if (s1[i - 1] == s2[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1];
            } else {
                dp[i][j] = 1 + min({dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]});
            }
        }
    }

    cout << dp[m][n] << "\\n";
    return 0;
}
`,
  },

  'merge-k-sorted-arrays': {
    python: `import sys
import heapq

def solve():
    raw = sys.stdin.read().split()
    if not raw:
        return
    k = int(raw[0])
    idx = 1
    arrays = []
    for _ in range(k):
        length = int(raw[idx])
        idx += 1
        arr = [int(x) for x in raw[idx:idx + length]]
        idx += length
        arrays.append(arr)
        
    # Min heap: (value, array_index, element_index)
    heap = []
    for i in range(k):
        if arrays[i]:
            heapq.heappush(heap, (arrays[i][0], i, 0))
            
    merged = []
    while heap:
        val, arr_idx, ele_idx = heapq.heappop(heap)
        merged.append(str(val))
        if ele_idx + 1 < len(arrays[arr_idx]):
            heapq.heappush(heap, (arrays[arr_idx][ele_idx + 1], arr_idx, ele_idx + 1))
            
    print(" ".join(merged))

if __name__ == '__main__':
    solve()
`,
    cpp: `#include <iostream>
#include <vector>
#include <queue>
#include <tuple>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int k;
    if (!(cin >> k)) return 0;

    vector<vector<long long>> arrays(k);
    for (int i = 0; i < k; ++i) {
        int len;
        cin >> len;
        arrays[i].resize(len);
        for (int j = 0; j < len; ++j) cin >> arrays[i][j];
    }

    // Min-heap: tuple<value, array_index, element_index>
    using Element = tuple<long long, int, int>;
    priority_queue<Element, vector<Element>, greater<Element>> pq;

    for (int i = 0; i < k; ++i) {
        if (!arrays[i].empty()) {
            pq.push({arrays[i][0], i, 0});
        }
    }

    bool first = true;
    while (!pq.empty()) {
        auto [val, arr_idx, ele_idx] = pq.top();
        pq.pop();

        if (!first) cout << " ";
        first = false;
        cout << val;

        if (ele_idx + 1 < (int)arrays[arr_idx].size()) {
            pq.push({arrays[arr_idx][ele_idx + 1], arr_idx, ele_idx + 1});
        }
    }
    cout << "\\n";

    return 0;
}
`,
  },

  'longest-consecutive-sequence': {
    python: `import sys

def solve():
    raw = sys.stdin.read().split()
    if not raw:
        return
    n = int(raw[0])
    nums = set([int(x) for x in raw[1:1 + n]])
    
    longest = 0
    for num in nums:
        # Check if it's the start of a streak
        if num - 1 not in nums:
            curr = num
            streak = 1
            while curr + 1 in nums:
                curr += 1
                streak += 1
            longest = max(longest, streak)
            
    print(longest)

if __name__ == '__main__':
    solve()
`,
    cpp: `#include <iostream>
#include <vector>
#include <unordered_set>
#include <algorithm>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int n;
    if (!(cin >> n) || n <= 0) {
        cout << 0 << "\\n";
        return 0;
    }

    unordered_set<long long> numSet;
    for (int i = 0; i < n; ++i) {
        long long x;
        cin >> x;
        numSet.insert(x);
    }

    int longest = 0;
    for (long long num : numSet) {
        if (numSet.find(num - 1) == numSet.end()) {
            long long curr = num;
            int streak = 1;
            while (numSet.find(curr + 1) != numSet.end()) {
                curr++;
                streak++;
            }
            longest = max(longest, streak);
        }
    }

    cout << longest << "\\n";
    return 0;
}
`,
  },

  'word-ladder': {
    python: `import sys
from collections import deque

def solve():
    raw = sys.stdin.read().split()
    if not raw:
        return
    begin = raw[0]
    end = raw[1]
    n = int(raw[2])
    word_set = set(raw[3:3 + n])
    
    if end not in word_set:
        print(0)
        return
        
    q = deque([(begin, 1)])
    visited = {begin}
    alpha = 'abcdefghijklmnopqrstuvwxyz'
    
    while q:
        word, dist = q.popleft()
        if word == end:
            print(dist)
            return
        for i in range(len(word)):
            for c in alpha:
                nxt = word[:i] + c + word[i+1:]
                if nxt in word_set and nxt not in visited:
                    visited.add(nxt)
                    q.append((nxt, dist + 1))
                    
    print(0)

if __name__ == '__main__':
    solve()
`,
    cpp: `#include <iostream>
#include <string>
#include <vector>
#include <unordered_set>
#include <queue>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    string beginWord, endWord;
    int n;
    if (!(cin >> beginWord >> endWord >> n)) return 0;

    unordered_set<string> dict;
    for (int i = 0; i < n; ++i) {
        string w;
        cin >> w;
        dict.insert(w);
    }

    if (dict.find(endWord) == dict.end()) {
        cout << 0 << "\\n";
        return 0;
    }

    queue<pair<string, int>> q;
    q.push({beginWord, 1});
    unordered_set<string> visited;
    visited.insert(beginWord);

    while (!q.empty()) {
        auto [word, dist] = q.front();
        q.pop();

        if (word == endWord) {
            cout << dist << "\\n";
            return 0;
        }

        string temp = word;
        for (int i = 0; i < (int)temp.length(); ++i) {
            char original = temp[i];
            for (char c = 'a'; c <= 'z'; ++c) {
                if (c == original) continue;
                temp[i] = c;
                if (dict.find(temp) != dict.end() && visited.find(temp) == visited.end()) {
                    visited.insert(temp);
                    q.push({temp, dist + 1});
                }
            }
            temp[i] = original;
        }
    }

    cout << 0 << "\\n";
    return 0;
}
`,
  },

  'n-queens': {
    python: `import sys

def solve():
    raw = sys.stdin.read().split()
    if not raw:
        return
    n = int(raw[0])
    
    count = 0
    def backtrack(row, cols, diags1, diags2):
        nonlocal count
        if row == n:
            count += 1
            return
        available = (~(cols | diags1 | diags2)) & ((1 << n) - 1)
        while available:
            bit = available & (-available)
            available &= available - 1
            backtrack(row + 1, cols | bit, (diags1 | bit) << 1, (diags2 | bit) >> 1)
            
    backtrack(0, 0, 0, 0)
    print(count)

if __name__ == '__main__':
    solve()
`,
    cpp: `#include <iostream>

using namespace std;

int totalCount = 0;
int nQueens;

void backtrack(int row, int cols, int diags1, int diags2) {
    if (row == nQueens) {
        totalCount++;
        return;
    }
    int available = (~(cols | diags1 | diags2)) & ((1 << nQueens) - 1);
    while (available) {
        int bit = available & (-available);
        available &= available - 1;
        backtrack(row + 1, cols | bit, (diags1 | bit) << 1, (diags2 | bit) >> 1);
    }
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    if (!(cin >> nQueens)) return 0;

    totalCount = 0;
    backtrack(0, 0, 0, 0);

    cout << totalCount << "\\n";
    return 0;
}
`,
  },
};

export const MODEL_SOLUTIONS: Readonly<Record<string, Readonly<IProblemModelSolutions>>> = Object.freeze(
  Object.fromEntries(
    Object.entries(rawModelSolutions).map(([k, v]) => [k, Object.freeze(v)])
  )
);

/**
 * Retrieve reference model solution for a given problem code and language.
 * Falls back to the standard starter code if no model solution is registered.
 */
export function getModelSolution(
  problemCode: string | undefined | null,
  language: SupportedLanguage = SupportedLanguages.PYTHON
): string {
  if (problemCode) {
    const normalized = problemCode.toLowerCase().trim();
    const solutions = MODEL_SOLUTIONS[normalized];
    if (solutions && solutions[language]) {
      return solutions[language];
    }
  }

  // Fallback to starter template
  return LANGUAGE_CONFIGS[language]?.starterCode || '';
}
