import { IProblemModelSolutions } from './types';

export const TWO_POINTERS_SOLUTIONS: Record<string, IProblemModelSolutions> = {
  'valid-palindrome': {
    python: `import sys

def solve():
    line = sys.stdin.read()
    if not line:
        print("true")
        return
    cleaned = [c.lower() for c in line if c.isalnum()]
    print("true" if cleaned == cleaned[::-1] else "false")

if __name__ == '__main__':
    solve()
`,
    cpp: `#include <iostream>
#include <string>
#include <cctype>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    string s;
    if (!getline(cin, s)) {
        cout << "true\\n";
        return 0;
    }

    int left = 0;
    int right = (int)s.length() - 1;

    bool isPal = true;
    while (left < right) {
        while (left < right && !isalnum(s[left])) left++;
        while (left < right && !isalnum(s[right])) right--;

        if (tolower(s[left]) != tolower(s[right])) {
            isPal = false;
            break;
        }
        left++;
        right--;
    }

    cout << (isPal ? "true" : "false") << "\\n";
    return 0;
}
`,
  },

  'two-sum-ii': {
    python: `import sys

def solve():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    n = int(tokens[0])
    target = int(tokens[1])
    nums = [int(x) for x in tokens[2:2 + n]]

    left = 0
    right = n - 1
    while left < right:
        curr_sum = nums[left] + nums[right]
        if curr_sum == target:
            print(f"{left + 1} {right + 1}")
            return
        elif curr_sum < target:
            left += 1
        else:
            right -= 1

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

    int left = 0;
    int right = n - 1;
    while (left < right) {
        long long sum = nums[left] + nums[right];
        if (sum == target) {
            cout << (left + 1) << " " << (right + 1) << "\\n";
            return 0;
        } else if (sum < target) {
            left++;
        } else {
            right--;
        }
    }

    return 0;
}
`,
  },

  'three-sum': {
    python: `import sys

def solve():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    n = int(tokens[0])
    if n < 3:
        return
    nums = sorted([int(x) for x in tokens[1:1 + n]])

    triplets = []
    for i in range(n - 2):
        if nums[i] > 0:
            break
        if i > 0 and nums[i] == nums[i - 1]:
            continue

        left = i + 1
        right = n - 1
        while left < right:
            s = nums[i] + nums[left] + nums[right]
            if s == 0:
                triplets.append((nums[i], nums[left], nums[right]))
                while left < right and nums[left] == nums[left + 1]:
                    left += 1
                while left < right and nums[right] == nums[right - 1]:
                    right -= 1
                left += 1
                right -= 1
            elif s < 0:
                left += 1
            else:
                right -= 1

    for t in triplets:
        print(f"{t[0]} {t[1]} {t[2]}")

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
    if (n < 3) return 0;

    vector<long long> nums(n);
    for (int i = 0; i < n; ++i) cin >> nums[i];

    sort(nums.begin(), nums.end());

    for (int i = 0; i < n - 2; ++i) {
        if (nums[i] > 0) break;
        if (i > 0 && nums[i] == nums[i - 1]) continue;

        int left = i + 1;
        int right = n - 1;

        while (left < right) {
            long long sum = nums[i] + nums[left] + nums[right];
            if (sum == 0) {
                cout << nums[i] << " " << nums[left] << " " << nums[right] << "\\n";
                while (left < right && nums[left] == nums[left + 1]) left++;
                while (left < right && nums[right] == nums[right - 1]) right--;
                left++;
                right--;
            } else if (sum < 0) {
                left++;
            } else {
                right--;
            }
        }
    }

    return 0;
}
`,
  },

  'container-with-most-water': {
    python: `import sys

def solve():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    n = int(tokens[0])
    height = [int(x) for x in tokens[1:1 + n]]

    left = 0
    right = n - 1
    max_area = 0

    while left < right:
        width = right - left
        h = min(height[left], height[right])
        area = width * h
        if area > max_area:
            max_area = area
        if height[left] < height[right]:
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

    vector<long long> height(n);
    for (int i = 0; i < n; ++i) cin >> height[i];

    int left = 0;
    int right = n - 1;
    long long maxArea = 0;

    while (left < right) {
        long long h = min(height[left], height[right]);
        long long area = h * (right - left);
        if (area > maxArea) maxArea = area;

        if (height[left] < height[right]) {
            left++;
        } else {
            right--;
        }
    }

    cout << maxArea << "\\n";
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
    left_max = height[left]
    right_max = height[right]
    water = 0

    while left < right:
        if left_max < right_max:
            left += 1
            if height[left] < left_max:
                water += left_max - height[left]
            else:
                left_max = height[left]
        else:
            right -= 1
            if height[right] < right_max:
                water += right_max - height[right]
            else:
                right_max = height[right]

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
    if (!(cin >> n)) return 0;
    if (n <= 2) {
        cout << 0 << "\\n";
        return 0;
    }

    vector<long long> height(n);
    for (int i = 0; i < n; ++i) cin >> height[i];

    int left = 0;
    int right = n - 1;
    long long leftMax = height[left];
    long long rightMax = height[right];
    long long water = 0;

    while (left < right) {
        if (leftMax < rightMax) {
            left++;
            if (height[left] < leftMax) {
                water += (leftMax - height[left]);
            } else {
                leftMax = height[left];
            }
        } else {
            right--;
            if (height[right] < rightMax) {
                water += (rightMax - height[right]);
            } else {
                rightMax = height[right];
            }
        }
    }

    cout << water << "\\n";
    return 0;
}
`,
  },
};
