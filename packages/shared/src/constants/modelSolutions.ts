import { SupportedLanguage, SupportedLanguages, LANGUAGE_CONFIGS } from './languages';

export interface IProblemModelSolutions {
  python: string;
  cpp: string;
}

export const MODEL_SOLUTIONS: Record<string, IProblemModelSolutions> = {
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
            if ((c == ')' && top == '(') ||
                (c == '}' && top == '{') ||
                (c == ']' && top == '[')) {
                st.pop();
            } else {
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
    if (cin >> t) {
        while (t--) {
            string s;
            cin >> s;
            if (isValid(s)) {
                cout << "true\\n";
            } else {
                cout << "false\\n";
            }
        }
    }
    return 0;
}
`,
  },
  'reverse-array': {
    python: `import sys

def solve():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    n = int(tokens[0])
    arr = tokens[1:1 + n]
    print(' '.join(reversed(arr)))

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

    vector<long long> a(n);
    for (int i = 0; i < n; ++i) {
        cin >> a[i];
    }

    for (int i = n - 1; i >= 0; --i) {
        cout << a[i] << (i == 0 ? "" : " ");
    }
    cout << "\\n";

    return 0;
}
`,
  },
  'longest-unique-substring': {
    python: `import sys

def length_of_longest_substring(s: str) -> int:
    char_index_map = {}
    max_len = 0
    start = 0

    for end, char in enumerate(s):
        if char in char_index_map and char_index_map[char] >= start:
            start = char_index_map[char] + 1
        char_index_map[char] = end
        max_len = max(max_len, end - start + 1)

    return max_len

def solve():
    raw = sys.stdin.read()
    if not raw:
        print(0)
        return
    s = raw.rstrip('\\r\\n')
    print(length_of_longest_substring(s))

if __name__ == '__main__':
    solve()
`,
    cpp: `#include <iostream>
#include <string>
#include <vector>
#include <algorithm>

using namespace std;

int lengthOfLongestSubstring(const string& s) {
    vector<int> lastIndex(256, -1);
    int maxLen = 0;
    int start = 0;

    for (int end = 0; end < (int)s.length(); ++end) {
        unsigned char c = s[end];
        if (lastIndex[c] >= start) {
            start = lastIndex[c] + 1;
        }
        lastIndex[c] = end;
        maxLen = max(maxLen, end - start + 1);
    }

    return maxLen;
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    string s;
    if (getline(cin, s)) {
        if (!s.empty() && s.back() == '\\r') {
            s.pop_back();
        }
        cout << lengthOfLongestSubstring(s) << "\\n";
    } else {
        cout << 0 << "\\n";
    }

    return 0;
}
`,
  },
  'maximum-subarray': {
    python: `import sys

def solve():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    n = int(tokens[0])
    nums = [int(x) for x in tokens[1:1 + n]]

    max_so_far = nums[0]
    current_max = nums[0]

    for num in nums[1:]:
        current_max = max(num, current_max + num)
        max_so_far = max(max_so_far, current_max)

    print(max_so_far)

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

    long long currentMax = first;
    long long maxSoFar = first;

    for (int i = 1; i < n; ++i) {
        long long num;
        cin >> num;
        currentMax = max(num, currentMax + num);
        maxSoFar = max(maxSoFar, currentMax);
    }

    cout << maxSoFar << "\\n";

    return 0;
}
`,
  },
  'trapping-rain-water': {
    python: `import sys

def solve():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    n = int(tokens[0])
    height = [int(x) for x in tokens[1:1 + n]]

    if n <= 2:
        print(0)
        return

    left = 0
    right = n - 1
    left_max = 0
    right_max = 0
    water = 0

    while left < right:
        if height[left] < height[right]:
            if height[left] >= left_max:
                left_max = height[left]
            else:
                water += left_max - height[left]
            left += 1
        else:
            if height[right] >= right_max:
                right_max = height[right]
            else:
                water += right_max - height[right]
            right -= 1

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
        if (n > 0) {
            for (int i = 0; i < n; ++i) { long long tmp; cin >> tmp; }
        }
        cout << 0 << "\\n";
        return 0;
    }

    vector<long long> height(n);
    for (int i = 0; i < n; ++i) {
        cin >> height[i];
    }

    int left = 0, right = n - 1;
    long long leftMax = 0, rightMax = 0;
    long long water = 0;

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
};

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
