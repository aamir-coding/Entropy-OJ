import { IProblemModelSolutions } from './types';

export const ARRAYS_HASHING_SOLUTIONS: Record<string, IProblemModelSolutions> = {
  'contains-duplicate': {
    python: `import sys

def solve():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    n = int(tokens[0])
    nums = tokens[1:1 + n]
    print("true" if len(set(nums)) < len(nums) else "false")

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
    seen.reserve(n);
    bool hasDuplicate = false;

    for (int i = 0; i < n; ++i) {
        long long val;
        cin >> val;
        if (!hasDuplicate) {
            if (seen.find(val) != seen.end()) {
                hasDuplicate = true;
            } else {
                seen.insert(val);
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
    s = lines[0].strip()
    t = lines[1].strip()
    if len(s) != len(t):
        print("false")
        return
    
    counts = [0] * 26
    for ch in s:
        counts[ord(ch) - ord('a')] += 1
    for ch in t:
        counts[ord(ch) - ord('a')] -= 1
        
    print("true" if all(c == 0 for c in counts) else "false")

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

    int counts[26] = {0};
    for (char c : s) counts[c - 'a']++;
    for (char c : t) counts[c - 'a']--;

    for (int i = 0; i < 26; ++i) {
        if (counts[i] != 0) {
            cout << "false\\n";
            return 0;
        }
    }

    cout << "true\\n";
    return 0;
}
`,
  },

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
    seen.reserve(n);
    for (int i = 0; i < n; ++i) {
        long long diff = target - nums[i];
        auto it = seen.find(diff);
        if (it != seen.end()) {
            int first = it->second;
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

  'group-anagrams': {
    python: `import sys
from collections import defaultdict

def solve():
    lines = sys.stdin.read().splitlines()
    if not lines:
        return
    n_str = lines[0].strip()
    if not n_str:
        return
    n = int(n_str)
    words = [lines[i] if i < len(lines) else "" for i in range(1, n + 1)]
    
    groups = defaultdict(list)
    for word in words:
        key = "".join(sorted(word))
        groups[key].append(word)
        
    sorted_groups = []
    for g in groups.values():
        g.sort()
        sorted_groups.append(g)
        
    sorted_groups.sort(key=lambda g: g[0] if g else "")
    for g in sorted_groups:
        print(" ".join(g))

if __name__ == '__main__':
    solve()
`,
    cpp: `#include <iostream>
#include <vector>
#include <string>
#include <unordered_map>
#include <algorithm>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int n;
    if (!(cin >> n)) return 0;
    string dummy;
    getline(cin, dummy);

    unordered_map<string, vector<string>> groups;
    for (int i = 0; i < n; ++i) {
        string s;
        getline(cin, s);
        string key = s;
        sort(key.begin(), key.end());
        groups[key].push_back(s);
    }

    vector<vector<string>> sortedGroups;
    for (auto& pair : groups) {
        sort(pair.second.begin(), pair.second.end());
        sortedGroups.push_back(pair.second);
    }

    sort(sortedGroups.begin(), sortedGroups.end(), [](const vector<string>& a, const vector<string>& b) {
        if (a.empty() || b.empty()) return a.size() < b.size();
        return a[0] < b[0];
    });

    for (const auto& g : sortedGroups) {
        for (size_t i = 0; i < g.size(); ++i) {
            cout << g[i] << (i + 1 == g.size() ? "" : " ");
        }
        cout << "\\n";
    }

    return 0;
}
`,
  },

  'top-k-frequent-elements': {
    python: `import sys
from collections import Counter

def solve():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    n = int(tokens[0])
    k = int(tokens[1])
    nums = [int(x) for x in tokens[2:2 + n]]
    
    counts = Counter(nums)
    # Sort primarily by frequency descending, then by number ascending
    sorted_items = sorted(counts.keys(), key=lambda x: (-counts[x], x))
    result = sorted_items[:k]
    print(" ".join(map(str, result)))

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

    int n, k;
    if (!(cin >> n >> k)) return 0;

    unordered_map<int, int> counts;
    counts.reserve(n);
    for (int i = 0; i < n; ++i) {
        int val;
        cin >> val;
        counts[val]++;
    }

    vector<pair<int, int>> items;
    items.reserve(counts.size());
    for (const auto& p : counts) {
        items.push_back(p);
    }

    sort(items.begin(), items.end(), [](const pair<int, int>& a, const pair<int, int>& b) {
        if (a.second != b.second) return a.second > b.second;
        return a.first < b.first;
    });

    for (int i = 0; i < k && i < (int)items.size(); ++i) {
        cout << items[i].first << (i + 1 == k ? "" : " ");
    }
    cout << "\\n";

    return 0;
}
`,
  },

  'product-of-array-except-self': {
    python: `import sys

def solve():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    n = int(tokens[0])
    nums = [int(x) for x in tokens[1:1 + n]]
    
    res = [1] * n
    prefix = 1
    for i in range(n):
        res[i] = prefix
        prefix *= nums[i]
        
    postfix = 1
    for i in range(n - 1, -1, -1):
        res[i] *= postfix
        postfix *= nums[i]
        
    print(" ".join(map(str, res)))

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

    vector<long long> nums(n);
    for (int i = 0; i < n; ++i) cin >> nums[i];

    vector<long long> res(n, 1);
    long long prefix = 1;
    for (int i = 0; i < n; ++i) {
        res[i] = prefix;
        prefix *= nums[i];
    }

    long long postfix = 1;
    for (int i = n - 1; i >= 0; --i) {
        res[i] *= postfix;
        postfix *= nums[i];
    }

    for (int i = 0; i < n; ++i) {
        cout << res[i] << (i + 1 == n ? "" : " ");
    }
    cout << "\\n";

    return 0;
}
`,
  },

  'valid-sudoku': {
    python: `import sys

def solve():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    # Read 81 cells
    cells = []
    for token in tokens:
        for ch in token:
            cells.append(ch)
            if len(cells) == 81:
                break
        if len(cells) == 81:
            break
            
    if len(cells) < 81:
        print("false")
        return

    rows = [set() for _ in range(9)]
    cols = [set() for _ in range(9)]
    boxes = [set() for _ in range(9)]

    for idx in range(81):
        ch = cells[idx]
        if ch == '.':
            continue
        r = idx // 9
        c = idx % 9
        b = (r // 3) * 3 + (c // 3)

        if ch in rows[r] or ch in cols[c] or ch in boxes[b]:
            print("false")
            return
        rows[r].add(ch)
        cols[c].add(ch)
        boxes[b].add(ch)

    print("true")

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

    vector<char> cells;
    string token;
    while (cin >> token) {
        for (char c : token) {
            cells.push_back(c);
            if (cells.size() == 81) break;
        }
        if (cells.size() == 81) break;
    }

    if (cells.size() < 81) {
        cout << "false\\n";
        return 0;
    }

    int rowMask[9] = {0};
    int colMask[9] = {0};
    int boxMask[9] = {0};

    for (int i = 0; i < 81; ++i) {
        char ch = cells[i];
        if (ch == '.') continue;
        if (ch < '1' || ch > '9') continue;

        int digit = ch - '1';
        int bit = 1 << digit;
        int r = i / 9;
        int c = i % 9;
        int b = (r / 3) * 3 + (c / 3);

        if ((rowMask[r] & bit) || (colMask[c] & bit) || (boxMask[b] & bit)) {
            cout << "false\\n";
            return 0;
        }

        rowMask[r] |= bit;
        colMask[c] |= bit;
        boxMask[b] |= bit;
    }

    cout << "true\\n";
    return 0;
}
`,
  },

  'encode-and-decode-strings': {
    python: `import sys

def encode(strs):
    encoded = []
    for s in strs:
        encoded.append(f"{len(s)}#{s}")
    return "".join(encoded)

def decode(s):
    res = []
    i = 0
    n = len(s)
    while i < n:
        j = s.find('#', i)
        if j == -1:
            break
        length = int(s[i:j])
        start = j + 1
        end = start + length
        res.append(s[start:end])
        i = end
    return res

def solve():
    lines = sys.stdin.read().splitlines()
    if not lines:
        return
    n_str = lines[0].strip()
    if not n_str:
        return
    n = int(n_str)
    strs = [lines[i] if i < len(lines) else "" for i in range(1, n + 1)]
    
    encoded = encode(strs)
    decoded = decode(encoded)
    for s in decoded:
        print(s)

if __name__ == '__main__':
    solve()
`,
    cpp: `#include <iostream>
#include <vector>
#include <string>

using namespace std;

string encode(const vector<string>& strs) {
    string encoded = "";
    for (const string& s : strs) {
        encoded += to_string(s.length()) + "#" + s;
    }
    return encoded;
}

vector<string> decode(const string& s) {
    vector<string> res;
    size_t i = 0;
    while (i < s.length()) {
        size_t j = s.find('#', i);
        if (j == string::npos) break;
        int len = stoi(s.substr(i, j - i));
        string word = s.substr(j + 1, len);
        res.push_back(word);
        i = j + 1 + len;
    }
    return res;
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int n;
    if (!(cin >> n)) return 0;
    string dummy;
    getline(cin, dummy);

    vector<string> strs(n);
    for (int i = 0; i < n; ++i) {
        getline(cin, strs[i]);
    }

    string encoded = encode(strs);
    vector<string> decoded = decode(encoded);

    for (const string& s : decoded) {
        cout << s << "\\n";
    }

    return 0;
}
`,
  },

  'longest-consecutive-sequence': {
    python: `import sys

def solve():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    n = int(tokens[0])
    if n == 0:
        print("0")
        return
    nums = [int(x) for x in tokens[1:1 + n]]
    num_set = set(nums)
    longest = 0
    
    for x in num_set:
        if (x - 1) not in num_set:
            curr = x
            streak = 1
            while (curr + 1) in num_set:
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
    if (!(cin >> n)) return 0;
    if (n == 0) {
        cout << 0 << "\\n";
        return 0;
    }

    unordered_set<long long> numSet;
    numSet.reserve(n);
    for (int i = 0; i < n; ++i) {
        long long val;
        cin >> val;
        numSet.insert(val);
    }

    int longest = 0;
    for (long long num : numSet) {
        if (numSet.find(num - 1) == numSet.end()) {
            long long currentNum = num;
            int currentStreak = 1;

            while (numSet.find(currentNum + 1) != numSet.end()) {
                currentNum += 1;
                currentStreak += 1;
            }

            longest = max(longest, currentStreak);
        }
    }

    cout << longest << "\\n";
    return 0;
}
`,
  },
};
