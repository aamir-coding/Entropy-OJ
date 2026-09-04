import { IProblemModelSolutions } from './types';

export const SLIDING_WINDOW_SOLUTIONS: Record<string, IProblemModelSolutions> = {
  'best-time-to-buy-and-sell-stock': {
    python: `import sys

def solve():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    n = int(tokens[0])
    if n <= 1:
        print(0)
        return
    prices = [int(x) for x in tokens[1:1 + n]]

    min_price = prices[0]
    max_profit = 0

    for p in prices[1:]:
        if p < min_price:
            min_price = p
        elif p - min_price > max_profit:
            max_profit = p - min_price

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
    if (!(cin >> n) || n <= 1) {
        cout << 0 << "\\n";
        return 0;
    }

    long long minPrice;
    cin >> minPrice;
    long long maxProfit = 0;

    for (int i = 1; i < n; ++i) {
        long long price;
        cin >> price;
        if (price < minPrice) {
            minPrice = price;
        } else if (price - minPrice > maxProfit) {
            maxProfit = price - minPrice;
        }
    }

    cout << maxProfit << "\\n";
    return 0;
}
`,
  },

  'longest-unique-substring': {
    python: `import sys

def solve():
    s = sys.stdin.read().rstrip('\\r\\n')
    if not s:
        print(0)
        return

    last_seen = {}
    left = 0
    max_len = 0

    for right, ch in enumerate(s):
        if ch in last_seen and last_seen[ch] >= left:
            left = last_seen[ch] + 1
        last_seen[ch] = right
        curr_len = right - left + 1
        if curr_len > max_len:
            max_len = curr_len

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
    if (!getline(cin, s) || s.empty()) {
        cout << 0 << "\\n";
        return 0;
    }

    vector<int> lastSeen(256, -1);
    int left = 0;
    int maxLen = 0;

    for (int right = 0; right < (int)s.length(); ++right) {
        unsigned char ch = (unsigned char)s[right];
        if (lastSeen[ch] >= left) {
            left = lastSeen[ch] + 1;
        }
        lastSeen[ch] = right;
        maxLen = max(maxLen, right - left + 1);
    }

    cout << maxLen << "\\n";
    return 0;
}
`,
  },

  'longest-repeating-character-replacement': {
    python: `import sys

def solve():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    s = tokens[0]
    k = int(tokens[1]) if len(tokens) > 1 else 0

    counts = {}
    left = 0
    max_freq = 0
    max_len = 0

    for right in range(len(s)):
        ch = s[right]
        counts[ch] = counts.get(ch, 0) + 1
        max_freq = max(max_freq, counts[ch])

        # If replacements needed > k, shrink window
        if (right - left + 1) - max_freq > k:
            counts[s[left]] -= 1
            left += 1

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
    int k = 0;
    if (!(cin >> s >> k)) return 0;

    int counts[26] = {0};
    int left = 0;
    int maxFreq = 0;
    int maxLen = 0;

    for (int right = 0; right < (int)s.length(); ++right) {
        counts[s[right] - 'A']++;
        maxFreq = max(maxFreq, counts[s[right] - 'A']);

        if ((right - left + 1) - maxFreq > k) {
            counts[s[left] - 'A']--;
            left++;
        }

        maxLen = max(maxLen, right - left + 1);
    }

    cout << maxLen << "\\n";
    return 0;
}
`,
  },

  'permutation-in-string': {
    python: `import sys

def solve():
    tokens = sys.stdin.read().split()
    if len(tokens) < 2:
        print("false")
        return
    s1, s2 = tokens[0], tokens[1]
    n1, n2 = len(s1), len(s2)
    if n1 > n2:
        print("false")
        return

    c1 = [0] * 26
    c2 = [0] * 26
    for i in range(n1):
        c1[ord(s1[i]) - ord('a')] += 1
        c2[ord(s2[i]) - ord('a')] += 1

    matches = sum(1 for i in range(26) if c1[i] == c2[i])

    for i in range(n1, n2):
        if matches == 26:
            print("true")
            return

        r = ord(s2[i]) - ord('a')
        c2[r] += 1
        if c2[r] == c1[r]:
            matches += 1
        elif c2[r] == c1[r] + 1:
            matches -= 1

        l = ord(s2[i - n1]) - ord('a')
        c2[l] -= 1
        if c2[l] == c1[l]:
            matches += 1
        elif c2[l] == c1[l] - 1:
            matches -= 1

    print("true" if matches == 26 else "false")

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

    string s1, s2;
    if (!(cin >> s1 >> s2)) {
        cout << "false\\n";
        return 0;
    }

    int n1 = s1.length();
    int n2 = s2.length();
    if (n1 > n2) {
        cout << "false\\n";
        return 0;
    }

    int c1[26] = {0};
    int c2[26] = {0};
    for (int i = 0; i < n1; ++i) {
        c1[s1[i] - 'a']++;
        c2[s2[i] - 'a']++;
    }

    int matches = 0;
    for (int i = 0; i < 26; ++i) {
        if (c1[i] == c2[i]) matches++;
    }

    for (int i = n1; i < n2; ++i) {
        if (matches == 26) {
            cout << "true\\n";
            return 0;
        }

        int r = s2[i] - 'a';
        c2[r]++;
        if (c2[r] == c1[r]) matches++;
        else if (c2[r] == c1[r] + 1) matches--;

        int l = s2[i - n1] - 'a';
        c2[l]--;
        if (c2[l] == c1[l]) matches++;
        else if (c2[l] == c1[l] - 1) matches--;
    }

    cout << (matches == 26 ? "true" : "false") << "\\n";
    return 0;
}
`,
  },

  'minimum-window-substring': {
    python: `import sys
from collections import Counter

def solve():
    lines = sys.stdin.read().split()
    if len(lines) < 2:
        return
    s, t = lines[0], lines[1]
    if not t or not s:
        return

    target_counts = Counter(t)
    required = len(target_counts)
    window_counts = {}

    formed = 0
    l = 0
    ans = (-1, 0, 0) # length, left, right

    for r in range(len(s)):
        ch = s[r]
        window_counts[ch] = window_counts.get(ch, 0) + 1

        if ch in target_counts and window_counts[ch] == target_counts[ch]:
            formed += 1

        while l <= r and formed == required:
            ch_l = s[l]
            if ans[0] == -1 or (r - l + 1) < ans[0]:
                ans = (r - l + 1, l, r)

            window_counts[ch_l] -= 1
            if ch_l in target_counts and window_counts[ch_l] < target_counts[ch_l]:
                formed -= 1
            l += 1

    if ans[0] != -1:
        print(s[ans[1]:ans[2] + 1])

if __name__ == '__main__':
    solve()
`,
    cpp: `#include <iostream>
#include <string>
#include <vector>
#include <unordered_map>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    string s, t;
    if (!(cin >> s >> t)) return 0;

    int targetCounts[128] = {0};
    bool needed[128] = {false};
    int required = 0;

    for (char c : t) {
        if (targetCounts[(unsigned char)c] == 0) required++;
        targetCounts[(unsigned char)c]++;
        needed[(unsigned char)c] = true;
    }

    int windowCounts[128] = {0};
    int formed = 0;
    int l = 0;
    int minLen = -1;
    int bestL = 0;

    for (int r = 0; r < (int)s.length(); ++r) {
        unsigned char ch = (unsigned char)s[r];
        windowCounts[ch]++;
        if (needed[ch] && windowCounts[ch] == targetCounts[ch]) {
            formed++;
        }

        while (l <= r && formed == required) {
            unsigned char chL = (unsigned char)s[l];
            int currLen = r - l + 1;
            if (minLen == -1 || currLen < minLen) {
                minLen = currLen;
                bestL = l;
            }

            windowCounts[chL]--;
            if (needed[chL] && windowCounts[chL] < targetCounts[chL]) {
                formed--;
            }
            l++;
        }
    }

    if (minLen != -1) {
        cout << s.substr(bestL, minLen) << "\\n";
    }

    return 0;
}
`,
  },

  'sliding-window-maximum': {
    python: `import sys
from collections import deque

def solve():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    n = int(tokens[0])
    k = int(tokens[1])
    nums = [int(x) for x in tokens[2:2 + n]]

    q = deque()
    res = []

    for i in range(n):
        # Remove elements outside window
        if q and q[0] < i - k + 1:
            q.popleft()

        # Remove smaller elements from queue
        while q and nums[q[-1]] < nums[i]:
            q.pop()

        q.append(i)

        if i >= k - 1:
            res.append(nums[q[0]])

    print(" ".join(map(str, res)))

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

    vector<int> nums(n);
    for (int i = 0; i < n; ++i) cin >> nums[i];

    deque<int> q;
    vector<int> res;
    res.reserve(n - k + 1);

    for (int i = 0; i < n; ++i) {
        if (!q.empty() && q.front() < i - k + 1) {
            q.pop_front();
        }

        while (!q.empty() && nums[q.back()] < nums[i]) {
            q.pop_back();
        }

        q.push_back(i);

        if (i >= k - 1) {
            res.push_back(nums[q.front()]);
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
};
