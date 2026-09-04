import { IProblemModelSolutions } from './types';

export const TRIES_SOLUTIONS: Record<string, IProblemModelSolutions> = {
  'implement-trie-prefix-tree': {
    python: `import sys

class TrieNode:
    def __init__(self):
        self.children = {}
        self.is_end = False

class Trie:
    def __init__(self):
        self.root = TrieNode()

    def insert(self, word: str) -> None:
        curr = self.root
        for ch in word:
            if ch not in curr.children:
                curr.children[ch] = TrieNode()
            curr = curr.children[ch]
        curr.is_end = True

    def search(self, word: str) -> bool:
        curr = self.root
        for ch in word:
            if ch not in curr.children:
                return False
            curr = curr.children[ch]
        return curr.is_end

    def starts_with(self, prefix: str) -> bool:
        curr = self.root
        for ch in prefix:
            if ch not in curr.children:
                return False
            curr = curr.children[ch]
        return True

def solve():
    lines = sys.stdin.read().splitlines()
    if not lines:
        return
    q = int(lines[0].strip())
    trie = Trie()

    for i in range(1, q + 1):
        if i >= len(lines):
            break
        parts = lines[i].strip().split()
        if not parts:
            continue
        op = parts[0]
        arg = parts[1]
        if op == 'insert':
            trie.insert(arg)
        elif op == 'search':
            print("true" if trie.search(arg) else "false")
        elif op == 'startsWith':
            print("true" if trie.starts_with(arg) else "false")

if __name__ == '__main__':
    solve()
`,
    cpp: `#include <iostream>
#include <string>
#include <vector>

using namespace std;

struct TrieNode {
    TrieNode* children[26] = {nullptr};
    bool isEnd = false;
};

class Trie {
    TrieNode* root;
public:
    Trie() { root = new TrieNode(); }

    void insert(const string& word) {
        TrieNode* curr = root;
        for (char c : word) {
            int idx = c - 'a';
            if (!curr->children[idx]) curr->children[idx] = new TrieNode();
            curr = curr->children[idx];
        }
        curr->isEnd = true;
    }

    bool search(const string& word) {
        TrieNode* curr = root;
        for (char c : word) {
            int idx = c - 'a';
            if (!curr->children[idx]) return false;
            curr = curr->children[idx];
        }
        return curr->isEnd;
    }

    bool startsWith(const string& prefix) {
        TrieNode* curr = root;
        for (char c : prefix) {
            int idx = c - 'a';
            if (!curr->children[idx]) return false;
            curr = curr->children[idx];
        }
        return true;
    }
};

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int q;
    if (!(cin >> q)) return 0;

    Trie trie;
    while (q--) {
        string op, arg;
        cin >> op >> arg;
        if (op == "insert") {
            trie.insert(arg);
        } else if (op == "search") {
            cout << (trie.search(arg) ? "true" : "false") << "\\n";
        } else if (op == "startsWith") {
            cout << (trie.startsWith(arg) ? "true" : "false") << "\\n";
        }
    }

    return 0;
}
`,
  },

  'design-add-and-search-words-data-structure': {
    python: `import sys

class TrieNode:
    def __init__(self):
        self.children = {}
        self.is_end = False

class WordDictionary:
    def __init__(self):
        self.root = TrieNode()

    def add_word(self, word: str) -> None:
        curr = self.root
        for ch in word:
            if ch not in curr.children:
                curr.children[ch] = TrieNode()
            curr = curr.children[ch]
        curr.is_end = True

    def search(self, word: str) -> bool:
        def dfs(node, idx):
            if idx == len(word):
                return node.is_end
            ch = word[idx]
            if ch == '.':
                for child in node.children.values():
                    if dfs(child, idx + 1):
                        return True
                return False
            else:
                if ch not in node.children:
                    return False
                return dfs(node.children[ch], idx + 1)

        return dfs(self.root, 0)

def solve():
    lines = sys.stdin.read().splitlines()
    if not lines:
        return
    q = int(lines[0].strip())
    wd = WordDictionary()

    for i in range(1, q + 1):
        if i >= len(lines):
            break
        parts = lines[i].strip().split()
        if not parts:
            continue
        op = parts[0]
        arg = parts[1]
        if op == 'addWord':
            wd.add_word(arg)
        elif op == 'search':
            print("true" if wd.search(arg) else "false")

if __name__ == '__main__':
    solve()
`,
    cpp: `#include <iostream>
#include <string>
#include <vector>

using namespace std;

struct TrieNode {
    TrieNode* children[26] = {nullptr};
    bool isEnd = false;
};

class WordDictionary {
    TrieNode* root;

    bool dfs(TrieNode* node, const string& word, size_t idx) {
        if (!node) return false;
        if (idx == word.length()) return node->isEnd;

        char c = word[idx];
        if (c == '.') {
            for (int i = 0; i < 26; ++i) {
                if (node->children[i] && dfs(node->children[i], word, idx + 1)) {
                    return true;
                }
            }
            return false;
        } else {
            int i = c - 'a';
            return dfs(node->children[i], word, idx + 1);
        }
    }

public:
    WordDictionary() { root = new TrieNode(); }

    void addWord(const string& word) {
        TrieNode* curr = root;
        for (char c : word) {
            int idx = c - 'a';
            if (!curr->children[idx]) curr->children[idx] = new TrieNode();
            curr = curr->children[idx];
        }
        curr->isEnd = true;
    }

    bool search(const string& word) {
        return dfs(root, word, 0);
    }
};

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int q;
    if (!(cin >> q)) return 0;

    WordDictionary wd;
    while (q--) {
        string op, arg;
        cin >> op >> arg;
        if (op == "addWord") {
            wd.addWord(arg);
        } else if (op == "search") {
            cout << (wd.search(arg) ? "true" : "false") << "\\n";
        }
    }

    return 0;
}
`,
  },

  'word-search-ii': {
    python: `import sys

class TrieNode:
    def __init__(self):
        self.children = {}
        self.word = None

def solve():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    m = int(tokens[0])
    n = int(tokens[1])
    idx = 2
    board = []
    for _ in range(m):
        row = tokens[idx:idx + n]
        board.append(row)
        idx += n

    w_count = int(tokens[idx])
    idx += 1
    words = tokens[idx:idx + w_count]

    # Build Trie
    root = TrieNode()
    for word in words:
        curr = root
        for ch in word:
            if ch not in curr.children:
                curr.children[ch] = TrieNode()
            curr = curr.children[ch]
        curr.word = word

    found = []
    rows, cols = m, n

    def dfs(r, c, node):
        ch = board[r][c]
        if ch not in node.children:
            return
        next_node = node.children[ch]
        if next_node.word:
            found.append(next_node.word)
            next_node.word = None # avoid duplicate additions

        board[r][c] = '#'
        for dr, dc in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
            nr, nc = r + dr, c + dc
            if 0 <= nr < rows and 0 <= nc < cols and board[nr][nc] != '#':
                dfs(nr, nc, next_node)
        board[r][c] = ch

    for r in range(rows):
        for c in range(cols):
            dfs(r, c, root)

    found.sort()
    print(" ".join(found))

if __name__ == '__main__':
    solve()
`,
    cpp: `#include <iostream>
#include <vector>
#include <string>
#include <algorithm>

using namespace std;

struct TrieNode {
    TrieNode* children[26] = {nullptr};
    string word = "";
};

void insertTrie(TrieNode* root, const string& word) {
    TrieNode* curr = root;
    for (char c : word) {
        int idx = c - 'a';
        if (!curr->children[idx]) curr->children[idx] = new TrieNode();
        curr = curr->children[idx];
    }
    curr->word = word;
}

void dfs(int r, int c, vector<vector<char>>& board, TrieNode* node, vector<string>& found, int m, int n) {
    char ch = board[r][c];
    int idx = ch - 'a';
    if (!node->children[idx]) return;

    TrieNode* nextNode = node->children[idx];
    if (!nextNode->word.empty()) {
        found.push_back(nextNode->word);
        nextNode->word = "";
    }

    board[r][c] = '#';
    int dr[4] = {-1, 1, 0, 0};
    int dc[4] = {0, 0, -1, 1};

    for (int i = 0; i < 4; ++i) {
        int nr = r + dr[i];
        int nc = c + dc[i];
        if (nr >= 0 && nr < m && nc >= 0 && nc < n && board[nr][nc] != '#') {
            dfs(nr, nc, board, nextNode, found, m, n);
        }
    }
    board[r][c] = ch;
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

    int w;
    if (!(cin >> w)) return 0;

    TrieNode* root = new TrieNode();
    for (int i = 0; i < w; ++i) {
        string s;
        cin >> s;
        insertTrie(root, s);
    }

    vector<string> found;
    for (int i = 0; i < m; ++i) {
        for (int j = 0; j < n; ++j) {
            dfs(i, j, board, root, found, m, n);
        }
    }

    sort(found.begin(), found.end());
    for (size_t i = 0; i < found.size(); ++i) {
        cout << found[i] << (i + 1 == found.size() ? "" : " ");
    }
    if (!found.empty()) cout << "\\n";

    return 0;
}
`,
  },
};
