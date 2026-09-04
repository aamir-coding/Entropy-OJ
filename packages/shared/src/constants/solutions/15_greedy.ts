import { IProblemModelSolutions } from './types';

export const GREEDY_SOLUTIONS: Record<string, IProblemModelSolutions> = {
  'maximum-subarray': {
    python: `import sys

def solve():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    n = int(tokens[0])
    nums = [int(x) for x in tokens[1:1 + n]]

    max_sum = nums[0]
    cur_sum = 0

    for x in nums:
        cur_sum = max(x, cur_sum + x)
        max_sum = max(max_sum, cur_sum)

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
    if (!(cin >> n)) return 0;

    long long maxSum, curSum = 0;
    cin >> maxSum;
    curSum = maxSum;

    for (int i = 1; i < n; ++i) {
        long long x;
        cin >> x;
        curSum = max(x, curSum + x);
        maxSum = max(maxSum, curSum);
    }

    cout << maxSum << "\\n";
    return 0;
}
`,
  },

  'jump-game': {
    python: `import sys

def solve():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    n = int(tokens[0])
    nums = [int(x) for x in tokens[1:1 + n]]

    max_reach = 0
    for i, x in enumerate(nums):
        if i > max_reach:
            print("false")
            return
        max_reach = max(max_reach, i + x)
        if max_reach >= n - 1:
            print("true")
            return

    print("true")

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

    int maxReach = 0;
    for (int i = 0; i < n; ++i) {
        if (i > maxReach) {
            cout << "false\\n";
            return 0;
        }
        maxReach = max(maxReach, i + nums[i]);
        if (maxReach >= n - 1) {
            cout << "true\\n";
            return 0;
        }
    }

    cout << "true\\n";
    return 0;
}
`,
  },

  'jump-game-ii': {
    python: `import sys

def solve():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    n = int(tokens[0])
    nums = [int(x) for x in tokens[1:1 + n]]

    if n <= 1:
        print(0)
        return

    jumps = 0
    curr_end = 0
    farthest = 0

    for i in range(n - 1):
        farthest = max(farthest, i + nums[i])
        if i == curr_end:
            jumps += 1
            curr_end = farthest
            if curr_end >= n - 1:
                break

    print(jumps)

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

    vector<int> nums(n);
    for (int i = 0; i < n; ++i) cin >> nums[i];

    int jumps = 0, currEnd = 0, farthest = 0;

    for (int i = 0; i < n - 1; ++i) {
        farthest = max(farthest, i + nums[i]);
        if (i == currEnd) {
            jumps++;
            currEnd = farthest;
            if (currEnd >= n - 1) break;
        }
    }

    cout << jumps << "\\n";
    return 0;
}
`,
  },

  'gas-station': {
    python: `import sys

def solve():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    n = int(tokens[0])
    gas = [int(x) for x in tokens[1:1 + n]]
    cost = [int(x) for x in tokens[1 + n:1 + 2 * n]]

    if sum(gas) < sum(cost):
        print(-1)
        return

    total = 0
    start = 0

    for i in range(n):
        total += gas[i] - cost[i]
        if total < 0:
            total = 0
            start = i + 1

    print(start)

if __name__ == '__main__':
    solve()
`,
    cpp: `#include <iostream>
#include <vector>
#include <numeric>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int n;
    if (!(cin >> n)) return 0;

    vector<int> gas(n), cost(n);
    long long totalGas = 0, totalCost = 0;

    for (int i = 0; i < n; ++i) {
        cin >> gas[i];
        totalGas += gas[i];
    }
    for (int i = 0; i < n; ++i) {
        cin >> cost[i];
        totalCost += cost[i];
    }

    if (totalGas < totalCost) {
        cout << -1 << "\\n";
        return 0;
    }

    int start = 0;
    long long cur = 0;

    for (int i = 0; i < n; ++i) {
        cur += gas[i] - cost[i];
        if (cur < 0) {
            cur = 0;
            start = i + 1;
        }
    }

    cout << start << "\\n";
    return 0;
}
`,
  },

  'hand-of-straights': {
    python: `import sys
from collections import Counter

def solve():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    n = int(tokens[0])
    group_size = int(tokens[1])
    hand = [int(x) for x in tokens[2:2 + n]]

    if n % group_size != 0:
        print("false")
        return

    count = Counter(hand)
    for card in sorted(count):
        c = count[card]
        if c > 0:
            for i in range(card, card + group_size):
                if count[i] < c:
                    print("false")
                    return
                count[i] -= c

    print("true")

if __name__ == '__main__':
    solve()
`,
    cpp: `#include <iostream>
#include <vector>
#include <map>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int n, groupSize;
    if (!(cin >> n >> groupSize)) return 0;

    map<int, int> count;
    for (int i = 0; i < n; ++i) {
        int x;
        cin >> x;
        count[x]++;
    }

    if (n % groupSize != 0) {
        cout << "false\\n";
        return 0;
    }

    for (auto [card, c] : count) {
        if (c > 0) {
            for (int i = 0; i < groupSize; ++i) {
                if (count[card + i] < c) {
                    cout << "false\\n";
                    return 0;
                }
                count[card + i] -= c;
            }
        }
    }

    cout << "true\\n";
    return 0;
}
`,
  },

  'merge-triplets-to-form-target-triplet': {
    python: `import sys

def solve():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    n = int(tokens[0])
    target = [int(tokens[1]), int(tokens[2]), int(tokens[3])]
    idx = 4

    matched = [False, False, False]

    for _ in range(n):
        a = int(tokens[idx])
        b = int(tokens[idx + 1])
        c = int(tokens[idx + 2])
        idx += 3

        if a <= target[0] and b <= target[1] and c <= target[2]:
            if a == target[0]:
                matched[0] = True
            if b == target[1]:
                matched[1] = True
            if c == target[2]:
                matched[2] = True

    print("true" if all(matched) else "false")

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

    int tx, ty, tz;
    cin >> tx >> ty >> tz;

    bool matchX = false, matchY = false, matchZ = false;

    for (int i = 0; i < n; ++i) {
        int a, b, c;
        cin >> a >> b >> c;
        if (a <= tx && b <= ty && c <= tz) {
            if (a == tx) matchX = true;
            if (b == ty) matchY = true;
            if (c == tz) matchZ = true;
        }
    }

    cout << (matchX && matchY && matchZ ? "true" : "false") << "\\n";
    return 0;
}
`,
  },

  'partition-labels': {
    python: `import sys

def solve():
    s = sys.stdin.read().strip()
    if not s:
        return

    last = {c: i for i, c in enumerate(s)}
    start, end = 0, 0
    res = []

    for i, c in enumerate(s):
        end = max(end, last[c])
        if i == end:
            res.append(end - start + 1)
            start = i + 1

    print(" ".join(map(str, res)))

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
    if (!(cin >> s) || s.empty()) return 0;

    int last[26];
    for (int i = 0; i < (int)s.length(); ++i) {
        last[s[i] - 'a'] = i;
    }

    int start = 0, end = 0;
    vector<int> res;

    for (int i = 0; i < (int)s.length(); ++i) {
        end = max(end, last[s[i] - 'a']);
        if (i == end) {
            res.push_back(end - start + 1);
            start = i + 1;
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

  'valid-parenthesis-string': {
    python: `import sys

def solve():
    s = sys.stdin.read().strip()
    if not s:
        print("true")
        return

    cmin, cmax = 0, 0
    for ch in s:
        if ch == '(':
            cmin += 1
            cmax += 1
        elif ch == ')':
            cmin -= 1
            cmax -= 1
        elif ch == '*':
            cmin -= 1
            cmax += 1

        if cmax < 0:
            print("false")
            return
        cmin = max(cmin, 0)

    print("true" if cmin == 0 else "false")

if __name__ == '__main__':
    solve()
`,
    cpp: `#include <iostream>
#include <string>
#include <algorithm>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    string s;
    if (!(cin >> s) || s.empty()) {
        cout << "true\\n";
        return 0;
    }

    int cmin = 0, cmax = 0;
    for (char c : s) {
        if (c == '(') {
            cmin++;
            cmax++;
        } else if (c == ')') {
            cmin--;
            cmax--;
        } else if (c == '*') {
            cmin--;
            cmax++;
        }

        if (cmax < 0) {
            cout << "false\\n";
            return 0;
        }
        cmin = max(cmin, 0);
    }

    cout << (cmin == 0 ? "true" : "false") << "\\n";
    return 0;
}
`,
  },
};
