import { IProblemModelSolutions } from './types';

export const BIT_MANIPULATION_SOLUTIONS: Record<string, IProblemModelSolutions> = {
  'single-number': {
    python: `import sys

def solve():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    n = int(tokens[0])
    res = 0
    for x in tokens[1:1 + n]:
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

    int res = 0;
    for (int i = 0; i < n; ++i) {
        int x;
        cin >> x;
        res ^= x;
    }

    cout << res << "\\n";
    return 0;
}
`,
  },

  'number-of-1-bits': {
    python: `import sys

def solve():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    n = int(tokens[0])
    count = 0
    while n > 0:
        n &= (n - 1)
        count += 1
    print(count)

if __name__ == '__main__':
    solve()
`,
    cpp: `#include <iostream>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    unsigned int n;
    if (!(cin >> n)) return 0;

    int count = 0;
    while (n > 0) {
        n &= (n - 1);
        count++;
    }

    cout << count << "\\n";
    return 0;
}
`,
  },

  'counting-bits': {
    python: `import sys

def solve():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    n = int(tokens[0])
    ans = [0] * (n + 1)
    for i in range(1, n + 1):
        ans[i] = ans[i >> 1] + (i & 1)
    print(" ".join(map(str, ans)))

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

    vector<int> ans(n + 1, 0);
    for (int i = 1; i <= n; ++i) {
        ans[i] = ans[i >> 1] + (i & 1);
    }

    for (int i = 0; i <= n; ++i) {
        cout << ans[i] << (i == n ? "" : " ");
    }
    cout << "\\n";
    return 0;
}
`,
  },

  'reverse-bits': {
    python: `import sys

def solve():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    n = int(tokens[0])
    res = 0
    for _ in range(32):
        res = (res << 1) | (n & 1)
        n >>= 1
    print(res)

if __name__ == '__main__':
    solve()
`,
    cpp: `#include <iostream>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    unsigned int n;
    if (!(cin >> n)) return 0;

    unsigned int res = 0;
    for (int i = 0; i < 32; ++i) {
        res = (res << 1) | (n & 1);
        n >>= 1;
    }

    cout << res << "\\n";
    return 0;
}
`,
  },

  'missing-number': {
    python: `import sys

def solve():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    n = int(tokens[0])
    expected = n * (n + 1) // 2
    actual = sum(int(x) for x in tokens[1:1 + n])
    print(expected - actual)

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

    long long expected = (long long)n * (n + 1) / 2;
    long long actual = 0;

    for (int i = 0; i < n; ++i) {
        long long x;
        cin >> x;
        actual += x;
    }

    cout << expected - actual << "\\n";
    return 0;
}
`,
  },

  'sum-of-two-integers': {
    python: `import sys

def solve():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    a = int(tokens[0])
    b = int(tokens[1])

    MASK = 0xFFFFFFFF
    INT_MAX = 0x7FFFFFFF

    while b != 0:
        sum_no_carry = (a ^ b) & MASK
        carry = ((a & b) << 1) & MASK
        a = sum_no_carry
        b = carry

    print(a if a <= INT_MAX else ~(a ^ MASK))

if __name__ == '__main__':
    solve()
`,
    cpp: `#include <iostream>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int a, b;
    if (!(cin >> a >> b)) return 0;

    while (b != 0) {
        unsigned int carry = (unsigned int)(a & b) << 1;
        a = a ^ b;
        b = carry;
    }

    cout << a << "\\n";
    return 0;
}
`,
  },

  'reverse-integer': {
    python: `import sys

def solve():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    x = int(tokens[0])

    sign = -1 if x < 0 else 1
    x = abs(x)

    res = 0
    while x > 0:
        res = res * 10 + (x % 10)
        x //= 10

    res *= sign
    if -2**31 <= res <= 2**31 - 1:
        print(res)
    else:
        print(0)

if __name__ == '__main__':
    solve()
`,
    cpp: `#include <iostream>
#include <climits>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int x;
    if (!(cin >> x)) return 0;

    int res = 0;
    while (x != 0) {
        int pop = x % 10;
        x /= 10;

        if (res > INT_MAX / 10 || (res == INT_MAX / 10 && pop > 7)) {
            cout << 0 << "\\n";
            return 0;
        }
        if (res < INT_MIN / 10 || (res == INT_MIN / 10 && pop < -8)) {
            cout << 0 << "\\n";
            return 0;
        }

        res = res * 10 + pop;
    }

    cout << res << "\\n";
    return 0;
}
`,
  },
};
