import { IProblemModelSolutions } from './types';

export const BACKTRACKING_SOLUTIONS: Record<string, IProblemModelSolutions> = {
  'subsets': {
    python: `import sys

def solve():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    n = int(tokens[0])
    nums = sorted([int(x) for x in tokens[1:1 + n]])

    res = []
    def backtrack(start, curr):
        res.append(list(curr))
        for i in range(start, n):
            curr.append(nums[i])
            backtrack(i + 1, curr)
            curr.pop()

    backtrack(0, [])
    # Lexicographical sort on subsets
    res.sort()
    for sub in res:
        print(" ".join(map(str, sub)))

if __name__ == '__main__':
    solve()
`,
    cpp: `#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

void backtrack(int start, const vector<int>& nums, vector<int>& curr, vector<vector<int>>& res) {
    res.push_back(curr);
    for (size_t i = start; i < nums.size(); ++i) {
        curr.push_back(nums[i]);
        backtrack(i + 1, nums, curr, res);
        curr.pop_back();
    }
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int n;
    if (!(cin >> n)) return 0;

    vector<int> nums(n);
    for (int i = 0; i < n; ++i) cin >> nums[i];
    sort(nums.begin(), nums.end());

    vector<vector<int>> res;
    vector<int> curr;
    backtrack(0, nums, curr, res);

    sort(res.begin(), res.end());

    for (const auto& sub : res) {
        for (size_t i = 0; i < sub.size(); ++i) {
            cout << sub[i] << (i + 1 == sub.size() ? "" : " ");
        }
        cout << "\\n";
    }

    return 0;
}
`,
  },

  'combination-sum': {
    python: `import sys

def solve():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    n = int(tokens[0])
    target = int(tokens[1])
    candidates = sorted([int(x) for x in tokens[2:2 + n]])

    res = []
    def backtrack(start, remain, curr):
        if remain == 0:
            res.append(list(curr))
            return
        for i in range(start, n):
            if candidates[i] > remain:
                break
            curr.append(candidates[i])
            backtrack(i, remain - candidates[i], curr)
            curr.pop()

    backtrack(0, target, [])
    res.sort()
    for comb in res:
        print(" ".join(map(str, comb)))

if __name__ == '__main__':
    solve()
`,
    cpp: `#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

void backtrack(size_t start, int remain, const vector<int>& candidates, vector<int>& curr, vector<vector<int>>& res) {
    if (remain == 0) {
        res.push_back(curr);
        return;
    }
    for (size_t i = start; i < candidates.size(); ++i) {
        if (candidates[i] > remain) break;
        curr.push_back(candidates[i]);
        backtrack(i, remain - candidates[i], candidates, curr, res);
        curr.pop_back();
    }
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int n, target;
    if (!(cin >> n >> target)) return 0;

    vector<int> candidates(n);
    for (int i = 0; i < n; ++i) cin >> candidates[i];
    sort(candidates.begin(), candidates.end());

    vector<vector<int>> res;
    vector<int> curr;
    backtrack(0, target, candidates, curr, res);

    sort(res.begin(), res.end());

    for (const auto& comb : res) {
        for (size_t i = 0; i < comb.size(); ++i) {
            cout << comb[i] << (i + 1 == comb.size() ? "" : " ");
        }
        cout << "\\n";
    }

    return 0;
}
`,
  },

  'permutations': {
    python: `import sys

def solve():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    n = int(tokens[0])
    nums = sorted([int(x) for x in tokens[1:1 + n]])

    res = []
    used = [False] * n

    def backtrack(curr):
        if len(curr) == n:
            res.append(list(curr))
            return
        for i in range(n):
            if not used[i]:
                used[i] = True
                curr.append(nums[i])
                backtrack(curr)
                curr.pop()
                used[i] = False

    backtrack([])
    res.sort()
    for perm in res:
        print(" ".join(map(str, perm)))

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
    sort(nums.begin(), nums.end());

    do {
        for (int i = 0; i < n; ++i) {
            cout << nums[i] << (i + 1 == n ? "" : " ");
        }
        cout << "\\n";
    } while (next_permutation(nums.begin(), nums.end()));

    return 0;
}
`,
  },

  'subsets-ii': {
    python: `import sys

def solve():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    n = int(tokens[0])
    nums = sorted([int(x) for x in tokens[1:1 + n]])

    res = []
    def backtrack(start, curr):
        res.append(list(curr))
        for i in range(start, n):
            if i > start and nums[i] == nums[i - 1]:
                continue
            curr.append(nums[i])
            backtrack(i + 1, curr)
            curr.pop()

    backtrack(0, [])
    res.sort()
    for sub in res:
        print(" ".join(map(str, sub)))

if __name__ == '__main__':
    solve()
`,
    cpp: `#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

void backtrack(size_t start, const vector<int>& nums, vector<int>& curr, vector<vector<int>>& res) {
    res.push_back(curr);
    for (size_t i = start; i < nums.size(); ++i) {
        if (i > start && nums[i] == nums[i - 1]) continue;
        curr.push_back(nums[i]);
        backtrack(i + 1, nums, curr, res);
        curr.pop_back();
    }
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int n;
    if (!(cin >> n)) return 0;

    vector<int> nums(n);
    for (int i = 0; i < n; ++i) cin >> nums[i];
    sort(nums.begin(), nums.end());

    vector<vector<int>> res;
    vector<int> curr;
    backtrack(0, nums, curr, res);

    sort(res.begin(), res.end());

    for (const auto& sub : res) {
        for (size_t i = 0; i < sub.size(); ++i) {
            cout << sub[i] << (i + 1 == sub.size() ? "" : " ");
        }
        cout << "\\n";
    }

    return 0;
}
`,
  },

  'combination-sum-ii': {
    python: `import sys

def solve():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    n = int(tokens[0])
    target = int(tokens[1])
    candidates = sorted([int(x) for x in tokens[2:2 + n]])

    res = []
    def backtrack(start, remain, curr):
        if remain == 0:
            res.append(list(curr))
            return
        for i in range(start, n):
            if candidates[i] > remain:
                break
            if i > start and candidates[i] == candidates[i - 1]:
                continue
            curr.append(candidates[i])
            backtrack(i + 1, remain - candidates[i], curr)
            curr.pop()

    backtrack(0, target, [])
    res.sort()
    for comb in res:
        print(" ".join(map(str, comb)))

if __name__ == '__main__':
    solve()
`,
    cpp: `#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

void backtrack(size_t start, int remain, const vector<int>& candidates, vector<int>& curr, vector<vector<int>>& res) {
    if (remain == 0) {
        res.push_back(curr);
        return;
    }
    for (size_t i = start; i < candidates.size(); ++i) {
        if (candidates[i] > remain) break;
        if (i > start && candidates[i] == candidates[i - 1]) continue;
        curr.push_back(candidates[i]);
        backtrack(i + 1, remain - candidates[i], candidates, curr, res);
        curr.pop_back();
    }
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int n, target;
    if (!(cin >> n >> target)) return 0;

    vector<int> candidates(n);
    for (int i = 0; i < n; ++i) cin >> candidates[i];
    sort(candidates.begin(), candidates.end());

    vector<vector<int>> res;
    vector<int> curr;
    backtrack(0, target, candidates, curr, res);

    sort(res.begin(), res.end());

    for (const auto& comb : res) {
        for (size_t i = 0; i < comb.size(); ++i) {
            cout << comb[i] << (i + 1 == comb.size() ? "" : " ");
        }
        cout << "\\n";
    }

    return 0;
}
`,
  },

  'word-search': {
    python: `import sys

def solve():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    m = int(tokens[0])
    n = int(tokens[1])
    idx = 2
    board = []
    for _ in range(m):
        board.append(tokens[idx:idx + n])
        idx += n

    word = tokens[idx]

    def dfs(r, c, k):
        if k == len(word):
            return True
        if r < 0 or r >= m or c < 0 or c >= n or board[r][c] != word[k]:
            return False

        tmp = board[r][c]
        board[r][c] = '#'
        for dr, dc in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
            if dfs(r + dr, c + dc, k + 1):
                board[r][c] = tmp
                return True
        board[r][c] = tmp
        return False

    for r in range(m):
        for c in range(n):
            if dfs(r, c, 0):
                print("true")
                return

    print("false")

if __name__ == '__main__':
    solve()
`,
    cpp: `#include <iostream>
#include <vector>
#include <string>

using namespace std;

bool dfs(int r, int c, int k, vector<vector<char>>& board, const string& word, int m, int n) {
    if (k == (int)word.length()) return true;
    if (r < 0 || r >= m || c < 0 || c >= n || board[r][c] != word[k]) return false;

    char tmp = board[r][c];
    board[r][c] = '#';

    int dr[4] = {-1, 1, 0, 0};
    int dc[4] = {0, 0, -1, 1};

    for (int i = 0; i < 4; ++i) {
        if (dfs(r + dr[i], c + dc[i], k + 1, board, word, m, n)) {
            board[r][c] = tmp;
            return true;
        }
    }

    board[r][c] = tmp;
    return false;
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int m, n;
    if (!(cin >> m >> n)) return 0;

    vector<vector<char>> board(m, vector<char>(n));
    for (int i = 0; i < m; ++i) {
        for (int j = 0; j < n; ++j) {
            cin >> board[i][j];
        }
    }

    string word;
    cin >> word;

    for (int r = 0; r < m; ++r) {
        for (int c = 0; c < n; ++c) {
            if (dfs(r, c, 0, board, word, m, n)) {
                cout << "true\\n";
                return 0;
            }
        }
    }

    cout << "false\\n";
    return 0;
}
`,
  },

  'palindrome-partitioning': {
    python: `import sys

def solve():
    s = sys.stdin.read().strip()
    if not s:
        return

    n = len(s)
    res = []

    def is_palindrome(sub):
        return sub == sub[::-1]

    def backtrack(start, curr):
        if start == n:
            res.append(list(curr))
            return
        for end in range(start + 1, n + 1):
            sub = s[start:end]
            if is_palindrome(sub):
                curr.append(sub)
                backtrack(end, curr)
                curr.pop()

    backtrack(0, [])
    res.sort()
    for part in res:
        print(" ".join(part))

if __name__ == '__main__':
    solve()
`,
    cpp: `#include <iostream>
#include <string>
#include <vector>
#include <algorithm>

using namespace std;

bool isPalindrome(const string& s, int l, int r) {
    while (l < r) {
        if (s[l++] != s[r--]) return false;
    }
    return true;
}

void backtrack(int start, const string& s, vector<string>& curr, vector<vector<string>>& res) {
    if (start == (int)s.length()) {
        res.push_back(curr);
        return;
    }
    for (int end = start; end < (int)s.length(); ++end) {
        if (isPalindrome(s, start, end)) {
            curr.push_back(s.substr(start, end - start + 1));
            backtrack(end + 1, s, curr, res);
            curr.pop_back();
        }
    }
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    string s;
    if (!(cin >> s) || s.empty()) return 0;

    vector<vector<string>> res;
    vector<string> curr;
    backtrack(0, s, curr, res);

    sort(res.begin(), res.end());

    for (const auto& part : res) {
        for (size_t i = 0; i < part.size(); ++i) {
            cout << part[i] << (i + 1 == part.size() ? "" : " ");
        }
        cout << "\\n";
    }

    return 0;
}
`,
  },

  'letter-combinations-of-a-phone-number': {
    python: `import sys

def solve():
    digits = sys.stdin.read().strip()
    if not digits:
        return

    phone = {
        '2': 'abc', '3': 'def', '4': 'ghi', '5': 'jkl',
        '6': 'mno', '7': 'pqrs', '8': 'tuv', '9': 'wxyz'
    }

    res = []
    def backtrack(idx, curr):
        if idx == len(digits):
            res.append("".join(curr))
            return
        for ch in phone.get(digits[idx], ''):
            curr.append(ch)
            backtrack(idx + 1, curr)
            curr.pop()

    backtrack(0, [])
    res.sort()
    print(" ".join(res))

if __name__ == '__main__':
    solve()
`,
    cpp: `#include <iostream>
#include <string>
#include <vector>
#include <algorithm>

using namespace std;

const string phone[] = {"", "", "abc", "def", "ghi", "jkl", "mno", "pqrs", "tuv", "wxyz"};

void backtrack(size_t idx, const string& digits, string& curr, vector<string>& res) {
    if (idx == digits.length()) {
        res.push_back(curr);
        return;
    }
    const string& letters = phone[digits[idx] - '0'];
    for (char c : letters) {
        curr.push_back(c);
        backtrack(idx + 1, digits, curr, res);
        curr.pop_back();
    }
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    string digits;
    if (!(cin >> digits) || digits.empty()) return 0;

    vector<string> res;
    string curr = "";
    backtrack(0, digits, curr, res);
    sort(res.begin(), res.end());

    for (size_t i = 0; i < res.size(); ++i) {
        cout << res[i] << (i + 1 == res.size() ? "" : " ");
    }
    cout << "\\n";

    return 0;
}
`,
  },

  'n-queens': {
    python: `import sys

def solve():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    n = int(tokens[0])

    cols = set()
    pos_diag = set() # r + c
    neg_diag = set() # r - c

    res = []
    board = [['.'] * n for _ in range(n)]

    def backtrack(r):
        if r == n:
            res.append(["".join(row) for row in board])
            return
        for c in range(n):
            if c in cols or (r + c) in pos_diag or (r - c) in neg_diag:
                continue

            cols.add(c)
            pos_diag.add(r + c)
            neg_diag.add(r - c)
            board[r][c] = 'Q'

            backtrack(r + 1)

            cols.remove(c)
            pos_diag.remove(r + c)
            neg_diag.remove(r - c)
            board[r][c] = '.'

    backtrack(0)
    res.sort()

    print(len(res))
    for sol in res:
        for row in sol:
            print(row)

if __name__ == '__main__':
    solve()
`,
    cpp: `#include <iostream>
#include <vector>
#include <string>
#include <algorithm>

using namespace std;

void backtrack(int r, int n, vector<bool>& cols, vector<bool>& posDiag, vector<bool>& negDiag,
               vector<string>& board, vector<vector<string>>& res) {
    if (r == n) {
        res.push_back(board);
        return;
    }
    for (int c = 0; c < n; ++c) {
        if (cols[c] || posDiag[r + c] || negDiag[r - c + n]) continue;

        cols[c] = posDiag[r + c] = negDiag[r - c + n] = true;
        board[r][c] = 'Q';

        backtrack(r + 1, n, cols, posDiag, negDiag, board, res);

        board[r][c] = '.';
        cols[c] = posDiag[r + c] = negDiag[r - c + n] = false;
    }
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int n;
    if (!(cin >> n)) return 0;

    vector<bool> cols(n, false);
    vector<bool> posDiag(2 * n, false);
    vector<bool> negDiag(2 * n, false);

    vector<string> board(n, string(n, '.'));
    vector<vector<string>> res;

    backtrack(0, n, cols, posDiag, negDiag, board, res);
    sort(res.begin(), res.end());

    cout << res.size() << "\\n";
    for (const auto& sol : res) {
        for (const string& row : sol) {
            cout << row << "\\n";
        }
    }

    return 0;
}
`,
  },
};
