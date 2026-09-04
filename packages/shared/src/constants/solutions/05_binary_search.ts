import { IProblemModelSolutions } from './types';

export const BINARY_SEARCH_SOLUTIONS: Record<string, IProblemModelSolutions> = {
  'binary-search': {
    python: `import sys

def solve():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    n = int(tokens[0])
    target = int(tokens[1])
    nums = [int(x) for x in tokens[2:2 + n]]

    left, right = 0, n - 1
    ans = -1

    while left <= right:
        mid = (left + right) // 2
        if nums[mid] == target:
            ans = mid
            break
        elif nums[mid] < target:
            left = mid + 1
        else:
            right = mid - 1

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

    int left = 0, right = n - 1;
    int ans = -1;

    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (nums[mid] == target) {
            ans = mid;
            break;
        } else if (nums[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }

    cout << ans << "\\n";
    return 0;
}
`,
  },

  'search-a-2d-matrix': {
    python: `import sys

def solve():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    m = int(tokens[0])
    n = int(tokens[1])
    target = int(tokens[2])
    matrix = [int(x) for x in tokens[3:3 + m * n]]

    left = 0
    right = m * n - 1
    found = False

    while left <= right:
        mid = (left + right) // 2
        val = matrix[mid]
        if val == target:
            found = True
            break
        elif val < target:
            left = mid + 1
        else:
            right = mid - 1

    print("true" if found else "false")

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
    long long target;
    if (!(cin >> m >> n >> target)) return 0;

    int total = m * n;
    vector<long long> matrix(total);
    for (int i = 0; i < total; ++i) cin >> matrix[i];

    int left = 0, right = total - 1;
    bool found = false;

    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (matrix[mid] == target) {
            found = true;
            break;
        } else if (matrix[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }

    cout << (found ? "true" : "false") << "\\n";
    return 0;
}
`,
  },

  'koko-eating-bananas': {
    python: `import sys
import math

def solve():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    n = int(tokens[0])
    h = int(tokens[1])
    piles = [int(x) for x in tokens[2:2 + n]]

    left = 1
    right = max(piles)
    ans = right

    while left <= right:
        mid = (left + right) // 2
        total_hours = sum(math.ceil(p / mid) for p in piles)

        if total_hours <= h:
            ans = mid
            right = mid - 1
        else:
            left = mid + 1

    print(ans)

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
    long long h;
    if (!(cin >> n >> h)) return 0;

    vector<long long> piles(n);
    long long maxPile = 0;
    for (int i = 0; i < n; ++i) {
        cin >> piles[i];
        if (piles[i] > maxPile) maxPile = piles[i];
    }

    long long left = 1, right = maxPile;
    long long ans = maxPile;

    while (left <= right) {
        long long mid = left + (right - left) / 2;
        long long totalHours = 0;

        for (int i = 0; i < n; ++i) {
            totalHours += (piles[i] + mid - 1) / mid;
        }

        if (totalHours <= h) {
            ans = mid;
            right = mid - 1;
        } else {
            left = mid + 1;
        }
    }

    cout << ans << "\\n";
    return 0;
}
`,
  },

  'find-minimum-in-rotated-sorted-array': {
    python: `import sys

def solve():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    n = int(tokens[0])
    nums = [int(x) for x in tokens[1:1 + n]]

    left, right = 0, n - 1

    while left < right:
        mid = (left + right) // 2
        if nums[mid] > nums[right]:
            left = mid + 1
        else:
            right = mid

    print(nums[left])

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

    int left = 0, right = n - 1;
    while (left < right) {
        int mid = left + (right - left) / 2;
        if (nums[mid] > nums[right]) {
            left = mid + 1;
        } else {
            right = mid;
        }
    }

    cout << nums[left] << "\\n";
    return 0;
}
`,
  },

  'search-in-rotated-sorted-array': {
    python: `import sys

def solve():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    n = int(tokens[0])
    target = int(tokens[1])
    nums = [int(x) for x in tokens[2:2 + n]]

    left, right = 0, n - 1
    ans = -1

    while left <= right:
        mid = (left + right) // 2
        if nums[mid] == target:
            ans = mid
            break

        # Left half is sorted
        if nums[left] <= nums[mid]:
            if nums[left] <= target < nums[mid]:
                right = mid - 1
            else:
                left = mid + 1
        # Right half is sorted
        else:
            if nums[mid] < target <= nums[right]:
                left = mid + 1
            else:
                right = mid - 1

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

    int left = 0, right = n - 1;
    int ans = -1;

    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (nums[mid] == target) {
            ans = mid;
            break;
        }

        if (nums[left] <= nums[mid]) {
            if (nums[left] <= target && target < nums[mid]) {
                right = mid - 1;
            } else {
                left = mid + 1;
            }
        } else {
            if (nums[mid] < target && target <= nums[right]) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }
    }

    cout << ans << "\\n";
    return 0;
}
`,
  },

  'time-based-key-value-store': {
    python: `import sys
import bisect

def solve():
    lines = sys.stdin.read().splitlines()
    if not lines:
        return
    q = int(lines[0].strip())
    store = {} # key -> list of (timestamp, value)

    for i in range(1, q + 1):
        if i >= len(lines):
            break
        parts = lines[i].strip().split()
        if not parts:
            continue
        op = parts[0]
        if op == 'set':
            key = parts[1]
            val = parts[2]
            ts = int(parts[3])
            if key not in store:
                store[key] = []
            store[key].append((ts, val))
        elif op == 'get':
            key = parts[1]
            ts = int(parts[2])
            if key not in store or not store[key]:
                print("")
            else:
                arr = store[key]
                # Binary search for rightmost timestamp <= ts
                idx = bisect.bisect_right(arr, (ts, chr(127))) - 1
                if idx >= 0:
                    print(arr[idx][1])
                else:
                    print("")

if __name__ == '__main__':
    solve()
`,
    cpp: `#include <iostream>
#include <string>
#include <vector>
#include <unordered_map>
#include <algorithm>

using namespace std;

struct Entry {
    int timestamp;
    string value;
};

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int q;
    if (!(cin >> q)) return 0;

    unordered_map<string, vector<Entry>> store;

    while (q--) {
        string op;
        cin >> op;
        if (op == "set") {
            string key, value;
            int timestamp;
            cin >> key >> value >> timestamp;
            store[key].push_back({timestamp, value});
        } else if (op == "get") {
            string key;
            int timestamp;
            cin >> key >> timestamp;

            auto it = store.find(key);
            if (it == store.end() || it->second.empty()) {
                cout << "\\n";
                continue;
            }

            const auto& arr = it->second;
            // binary search for rightmost <= timestamp
            int left = 0, right = (int)arr.size() - 1;
            int best = -1;

            while (left <= right) {
                int mid = left + (right - left) / 2;
                if (arr[mid].timestamp <= timestamp) {
                    best = mid;
                    left = mid + 1;
                } else {
                    right = mid - 1;
                }
            }

            if (best != -1) {
                cout << arr[best].value << "\\n";
            } else {
                cout << "\\n";
            }
        }
    }

    return 0;
}
`,
  },

  'median-of-two-sorted-arrays': {
    python: `import sys

def solve():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    m = int(tokens[0])
    n = int(tokens[1])
    idx = 2
    nums1 = [int(x) for x in tokens[idx:idx + m]]
    idx += m
    nums2 = [int(x) for x in tokens[idx:idx + n]]

    if len(nums1) > len(nums2):
        nums1, nums2 = nums2, nums1
        m, n = n, m

    total = m + n
    half = (total + 1) // 2
    left, right = 0, m

    while left <= right:
        i = (left + right) // 2
        j = half - i

        nums1_left = nums1[i - 1] if i > 0 else float('-inf')
        nums1_right = nums1[i] if i < m else float('inf')
        nums2_left = nums2[j - 1] if j > 0 else float('-inf')
        nums2_right = nums2[j] if j < n else float('inf')

        if nums1_left <= nums2_right and nums2_left <= nums1_right:
            if total % 2 == 1:
                ans = max(nums1_left, nums2_left)
            else:
                ans = (max(nums1_left, nums2_left) + min(nums1_right, nums2_right)) / 2.0
            print(f"{ans:.5f}")
            return
        elif nums1_left > nums2_right:
            right = i - 1
        else:
            left = i + 1

if __name__ == '__main__':
    solve()
`,
    cpp: `#include <iostream>
#include <vector>
#include <algorithm>
#include <iomanip>
#include <climits>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int m, n;
    if (!(cin >> m >> n)) return 0;

    vector<long long> nums1(m);
    for (int i = 0; i < m; ++i) cin >> nums1[i];

    vector<long long> nums2(n);
    for (int i = 0; i < n; ++i) cin >> nums2[i];

    if (m > n) {
        swap(nums1, nums2);
        swap(m, n);
    }

    int total = m + n;
    int half = (total + 1) / 2;
    int left = 0, right = m;

    while (left <= right) {
        int i = left + (right - left) / 2;
        int j = half - i;

        long long nums1Left = (i > 0) ? nums1[i - 1] : LLONG_MIN;
        long long nums1Right = (i < m) ? nums1[i] : LLONG_MAX;
        long long nums2Left = (j > 0) ? nums2[j - 1] : LLONG_MIN;
        long long nums2Right = (j < n) ? nums2[j] : LLONG_MAX;

        if (nums1Left <= nums2Right && nums2Left <= nums1Right) {
            double ans;
            if (total % 2 == 1) {
                ans = (double)max(nums1Left, nums2Left);
            } else {
                ans = (max(nums1Left, nums2Left) + min(nums1Right, nums2Right)) / 2.0;
            }
            cout << fixed << setprecision(5) << ans << "\\n";
            return 0;
        } else if (nums1Left > nums2Right) {
            right = i - 1;
        } else {
            left = i + 1;
        }
    }

    return 0;
}
`,
  },
};
