import { IProblemModelSolutions } from './types';

export const TREES_SOLUTIONS: Record<string, IProblemModelSolutions> = {
  'invert-binary-tree': {
    python: `import sys
from collections import deque

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def build_tree(tokens):
    if not tokens:
        return None
    root = TreeNode(tokens[0])
    q = deque([root])
    i = 1
    while q and i < len(tokens):
        node = q.popleft()
        if i < len(tokens) and tokens[i] != 'null':
            node.left = TreeNode(tokens[i])
            q.append(node.left)
        i += 1
        if i < len(tokens) and tokens[i] != 'null':
            node.right = TreeNode(tokens[i])
            q.append(node.right)
        i += 1
    return root

def invert_tree(root):
    if not root:
        return None
    root.left, root.right = invert_tree(root.right), invert_tree(root.left)
    return root

def serialize_tree(root):
    if not root:
        return []
    res = []
    q = deque([root])
    while q:
        node = q.popleft()
        if node:
            res.append(str(node.val))
            q.append(node.left)
            q.append(node.right)
        else:
            res.append('null')
    while res and res[-1] == 'null':
        res.pop()
    return res

def solve():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    n = int(tokens[0])
    tree_tokens = tokens[1:1 + n]
    root = build_tree(tree_tokens)
    inverted = invert_tree(root)
    out = serialize_tree(inverted)
    if out:
        print(" ".join(out))

if __name__ == '__main__':
    solve()
`,
    cpp: `#include <iostream>
#include <vector>
#include <string>
#include <queue>

using namespace std;

struct TreeNode {
    string val;
    TreeNode* left;
    TreeNode* right;
    TreeNode(string v) : val(v), left(nullptr), right(nullptr) {}
};

TreeNode* buildTree(const vector<string>& tokens) {
    if (tokens.empty()) return nullptr;
    TreeNode* root = new TreeNode(tokens[0]);
    queue<TreeNode*> q;
    q.push(root);
    size_t i = 1;
    while (!q.empty() && i < tokens.size()) {
        TreeNode* curr = q.front(); q.pop();
        if (i < tokens.size() && tokens[i] != "null") {
            curr->left = new TreeNode(tokens[i]);
            q.push(curr->left);
        }
        i++;
        if (i < tokens.size() && tokens[i] != "null") {
            curr->right = new TreeNode(tokens[i]);
            q.push(curr->right);
        }
        i++;
    }
    return root;
}

TreeNode* invert(TreeNode* root) {
    if (!root) return nullptr;
    TreeNode* left = invert(root->left);
    TreeNode* right = invert(root->right);
    root->left = right;
    root->right = left;
    return root;
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int n;
    if (!(cin >> n) || n <= 0) return 0;

    vector<string> tokens(n);
    for (int i = 0; i < n; ++i) cin >> tokens[i];

    TreeNode* root = buildTree(tokens);
    root = invert(root);

    vector<string> res;
    queue<TreeNode*> q;
    q.push(root);
    while (!q.empty()) {
        TreeNode* curr = q.front(); q.pop();
        if (curr) {
            res.push_back(curr->val);
            q.push(curr->left);
            q.push(curr->right);
        } else {
            res.push_back("null");
        }
    }
    while (!res.empty() && res.back() == "null") res.pop_back();

    for (size_t i = 0; i < res.size(); ++i) {
        cout << res[i] << (i + 1 == res.size() ? "" : " ");
    }
    if (!res.empty()) cout << "\\n";

    return 0;
}
`,
  },

  'maximum-depth-of-binary-tree': {
    python: `import sys
from collections import deque

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def build_tree(tokens):
    if not tokens:
        return None
    root = TreeNode(tokens[0])
    q = deque([root])
    i = 1
    while q and i < len(tokens):
        node = q.popleft()
        if i < len(tokens) and tokens[i] != 'null':
            node.left = TreeNode(tokens[i])
            q.append(node.left)
        i += 1
        if i < len(tokens) and tokens[i] != 'null':
            node.right = TreeNode(tokens[i])
            q.append(node.right)
        i += 1
    return root

def max_depth(root):
    if not root:
        return 0
    return 1 + max(max_depth(root.left), max_depth(root.right))

def solve():
    tokens = sys.stdin.read().split()
    if not tokens:
        print(0)
        return
    n = int(tokens[0])
    if n == 0:
        print(0)
        return
    tree_tokens = tokens[1:1 + n]
    root = build_tree(tree_tokens)
    print(max_depth(root))

if __name__ == '__main__':
    solve()
`,
    cpp: `#include <iostream>
#include <vector>
#include <string>
#include <queue>
#include <algorithm>

using namespace std;

struct TreeNode {
    string val;
    TreeNode* left;
    TreeNode* right;
    TreeNode(string v) : val(v), left(nullptr), right(nullptr) {}
};

TreeNode* buildTree(const vector<string>& tokens) {
    if (tokens.empty()) return nullptr;
    TreeNode* root = new TreeNode(tokens[0]);
    queue<TreeNode*> q;
    q.push(root);
    size_t i = 1;
    while (!q.empty() && i < tokens.size()) {
        TreeNode* curr = q.front(); q.pop();
        if (i < tokens.size() && tokens[i] != "null") {
            curr->left = new TreeNode(tokens[i]);
            q.push(curr->left);
        }
        i++;
        if (i < tokens.size() && tokens[i] != "null") {
            curr->right = new TreeNode(tokens[i]);
            q.push(curr->right);
        }
        i++;
    }
    return root;
}

int maxDepth(TreeNode* root) {
    if (!root) return 0;
    return 1 + max(maxDepth(root->left), maxDepth(root->right));
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int n;
    if (!(cin >> n) || n <= 0) {
        cout << 0 << "\\n";
        return 0;
    }

    vector<string> tokens(n);
    for (int i = 0; i < n; ++i) cin >> tokens[i];

    TreeNode* root = buildTree(tokens);
    cout << maxDepth(root) << "\\n";
    return 0;
}
`,
  },

  'diameter-of-binary-tree': {
    python: `import sys
from collections import deque

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def build_tree(tokens):
    if not tokens:
        return None
    root = TreeNode(tokens[0])
    q = deque([root])
    i = 1
    while q and i < len(tokens):
        node = q.popleft()
        if i < len(tokens) and tokens[i] != 'null':
            node.left = TreeNode(tokens[i])
            q.append(node.left)
        i += 1
        if i < len(tokens) and tokens[i] != 'null':
            node.right = TreeNode(tokens[i])
            q.append(node.right)
        i += 1
    return root

def solve():
    tokens = sys.stdin.read().split()
    if not tokens:
        print(0)
        return
    n = int(tokens[0])
    if n == 0:
        print(0)
        return
    tree_tokens = tokens[1:1 + n]
    root = build_tree(tree_tokens)

    diameter = 0
    def depth(node):
        nonlocal diameter
        if not node:
            return 0
        left_h = depth(node.left)
        right_h = depth(node.right)
        diameter = max(diameter, left_h + right_h)
        return 1 + max(left_h, right_h)

    depth(root)
    print(diameter)

if __name__ == '__main__':
    solve()
`,
    cpp: `#include <iostream>
#include <vector>
#include <string>
#include <queue>
#include <algorithm>

using namespace std;

struct TreeNode {
    string val;
    TreeNode* left;
    TreeNode* right;
    TreeNode(string v) : val(v), left(nullptr), right(nullptr) {}
};

TreeNode* buildTree(const vector<string>& tokens) {
    if (tokens.empty()) return nullptr;
    TreeNode* root = new TreeNode(tokens[0]);
    queue<TreeNode*> q;
    q.push(root);
    size_t i = 1;
    while (!q.empty() && i < tokens.size()) {
        TreeNode* curr = q.front(); q.pop();
        if (i < tokens.size() && tokens[i] != "null") {
            curr->left = new TreeNode(tokens[i]);
            q.push(curr->left);
        }
        i++;
        if (i < tokens.size() && tokens[i] != "null") {
            curr->right = new TreeNode(tokens[i]);
            q.push(curr->right);
        }
        i++;
    }
    return root;
}

int depth(TreeNode* root, int& diameter) {
    if (!root) return 0;
    int leftH = depth(root->left, diameter);
    int rightH = depth(root->right, diameter);
    diameter = max(diameter, leftH + rightH);
    return 1 + max(leftH, rightH);
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int n;
    if (!(cin >> n) || n <= 0) {
        cout << 0 << "\\n";
        return 0;
    }

    vector<string> tokens(n);
    for (int i = 0; i < n; ++i) cin >> tokens[i];

    TreeNode* root = buildTree(tokens);
    int diameter = 0;
    depth(root, diameter);

    cout << diameter << "\\n";
    return 0;
}
`,
  },

  'balanced-binary-tree': {
    python: `import sys
from collections import deque

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def build_tree(tokens):
    if not tokens:
        return None
    root = TreeNode(tokens[0])
    q = deque([root])
    i = 1
    while q and i < len(tokens):
        node = q.popleft()
        if i < len(tokens) and tokens[i] != 'null':
            node.left = TreeNode(tokens[i])
            q.append(node.left)
        i += 1
        if i < len(tokens) and tokens[i] != 'null':
            node.right = TreeNode(tokens[i])
            q.append(node.right)
        i += 1
    return root

def check_height(node):
    if not node:
        return 0
    lh = check_height(node.left)
    if lh == -1:
        return -1
    rh = check_height(node.right)
    if rh == -1:
        return -1
    if abs(lh - rh) > 1:
        return -1
    return 1 + max(lh, rh)

def solve():
    tokens = sys.stdin.read().split()
    if not tokens:
        print("true")
        return
    n = int(tokens[0])
    if n == 0:
        print("true")
        return
    tree_tokens = tokens[1:1 + n]
    root = build_tree(tree_tokens)
    print("true" if check_height(root) != -1 else "false")

if __name__ == '__main__':
    solve()
`,
    cpp: `#include <iostream>
#include <vector>
#include <string>
#include <queue>
#include <cmath>
#include <algorithm>

using namespace std;

struct TreeNode {
    string val;
    TreeNode* left;
    TreeNode* right;
    TreeNode(string v) : val(v), left(nullptr), right(nullptr) {}
};

TreeNode* buildTree(const vector<string>& tokens) {
    if (tokens.empty()) return nullptr;
    TreeNode* root = new TreeNode(tokens[0]);
    queue<TreeNode*> q;
    q.push(root);
    size_t i = 1;
    while (!q.empty() && i < tokens.size()) {
        TreeNode* curr = q.front(); q.pop();
        if (i < tokens.size() && tokens[i] != "null") {
            curr->left = new TreeNode(tokens[i]);
            q.push(curr->left);
        }
        i++;
        if (i < tokens.size() && tokens[i] != "null") {
            curr->right = new TreeNode(tokens[i]);
            q.push(curr->right);
        }
        i++;
    }
    return root;
}

int checkHeight(TreeNode* root) {
    if (!root) return 0;
    int lh = checkHeight(root->left);
    if (lh == -1) return -1;
    int rh = checkHeight(root->right);
    if (rh == -1) return -1;
    if (abs(lh - rh) > 1) return -1;
    return 1 + max(lh, rh);
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int n;
    if (!(cin >> n) || n <= 0) {
        cout << "true\\n";
        return 0;
    }

    vector<string> tokens(n);
    for (int i = 0; i < n; ++i) cin >> tokens[i];

    TreeNode* root = buildTree(tokens);
    cout << (checkHeight(root) != -1 ? "true" : "false") << "\\n";
    return 0;
}
`,
  },

  'same-tree': {
    python: `import sys
from collections import deque

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def build_tree(tokens):
    if not tokens:
        return None
    root = TreeNode(tokens[0])
    q = deque([root])
    i = 1
    while q and i < len(tokens):
        node = q.popleft()
        if i < len(tokens) and tokens[i] != 'null':
            node.left = TreeNode(tokens[i])
            q.append(node.left)
        i += 1
        if i < len(tokens) and tokens[i] != 'null':
            node.right = TreeNode(tokens[i])
            q.append(node.right)
        i += 1
    return root

def is_same(p, q):
    if not p and not q:
        return True
    if not p or not q or p.val != q.val:
        return False
    return is_same(p.left, q.left) and is_same(p.right, q.right)

def solve():
    tokens = sys.stdin.read().split()
    if not tokens:
        print("true")
        return
    idx = 0
    n = int(tokens[idx])
    idx += 1
    p_tokens = tokens[idx:idx + n]
    idx += n
    m = int(tokens[idx])
    idx += 1
    q_tokens = tokens[idx:idx + m]

    root_p = build_tree(p_tokens)
    root_q = build_tree(q_tokens)
    print("true" if is_same(root_p, root_q) else "false")

if __name__ == '__main__':
    solve()
`,
    cpp: `#include <iostream>
#include <vector>
#include <string>
#include <queue>

using namespace std;

struct TreeNode {
    string val;
    TreeNode* left;
    TreeNode* right;
    TreeNode(string v) : val(v), left(nullptr), right(nullptr) {}
};

TreeNode* buildTree(const vector<string>& tokens) {
    if (tokens.empty()) return nullptr;
    TreeNode* root = new TreeNode(tokens[0]);
    queue<TreeNode*> q;
    q.push(root);
    size_t i = 1;
    while (!q.empty() && i < tokens.size()) {
        TreeNode* curr = q.front(); q.pop();
        if (i < tokens.size() && tokens[i] != "null") {
            curr->left = new TreeNode(tokens[i]);
            q.push(curr->left);
        }
        i++;
        if (i < tokens.size() && tokens[i] != "null") {
            curr->right = new TreeNode(tokens[i]);
            q.push(curr->right);
        }
        i++;
    }
    return root;
}

bool isSame(TreeNode* p, TreeNode* q) {
    if (!p && !q) return true;
    if (!p || !q || p->val != q->val) return false;
    return isSame(p->left, q->left) && isSame(p->right, q->right);
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int n, m;
    if (!(cin >> n)) {
        cout << "true\\n";
        return 0;
    }

    vector<string> pTokens(n);
    for (int i = 0; i < n; ++i) cin >> pTokens[i];

    if (!(cin >> m)) {
        cout << "false\\n";
        return 0;
    }

    vector<string> qTokens(m);
    for (int i = 0; i < m; ++i) cin >> qTokens[i];

    TreeNode* rootP = buildTree(pTokens);
    TreeNode* rootQ = buildTree(qTokens);

    cout << (isSame(rootP, rootQ) ? "true" : "false") << "\\n";
    return 0;
}
`,
  },

  'subtree-of-another-tree': {
    python: `import sys
from collections import deque

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def build_tree(tokens):
    if not tokens:
        return None
    root = TreeNode(tokens[0])
    q = deque([root])
    i = 1
    while q and i < len(tokens):
        node = q.popleft()
        if i < len(tokens) and tokens[i] != 'null':
            node.left = TreeNode(tokens[i])
            q.append(node.left)
        i += 1
        if i < len(tokens) and tokens[i] != 'null':
            node.right = TreeNode(tokens[i])
            q.append(node.right)
        i += 1
    return root

def is_same(p, q):
    if not p and not q:
        return True
    if not p or not q or p.val != q.val:
        return False
    return is_same(p.left, q.left) and is_same(p.right, q.right)

def is_subtree(root, sub_root):
    if not root:
        return False
    if is_same(root, sub_root):
        return True
    return is_subtree(root.left, sub_root) or is_subtree(root.right, sub_root)

def solve():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    idx = 0
    n = int(tokens[idx])
    idx += 1
    root_tokens = tokens[idx:idx + n]
    idx += n
    m = int(tokens[idx])
    idx += 1
    sub_tokens = tokens[idx:idx + m]

    root = build_tree(root_tokens)
    sub_root = build_tree(sub_tokens)

    print("true" if is_subtree(root, sub_root) else "false")

if __name__ == '__main__':
    solve()
`,
    cpp: `#include <iostream>
#include <vector>
#include <string>
#include <queue>

using namespace std;

struct TreeNode {
    string val;
    TreeNode* left;
    TreeNode* right;
    TreeNode(string v) : val(v), left(nullptr), right(nullptr) {}
};

TreeNode* buildTree(const vector<string>& tokens) {
    if (tokens.empty()) return nullptr;
    TreeNode* root = new TreeNode(tokens[0]);
    queue<TreeNode*> q;
    q.push(root);
    size_t i = 1;
    while (!q.empty() && i < tokens.size()) {
        TreeNode* curr = q.front(); q.pop();
        if (i < tokens.size() && tokens[i] != "null") {
            curr->left = new TreeNode(tokens[i]);
            q.push(curr->left);
        }
        i++;
        if (i < tokens.size() && tokens[i] != "null") {
            curr->right = new TreeNode(tokens[i]);
            q.push(curr->right);
        }
        i++;
    }
    return root;
}

bool isSame(TreeNode* p, TreeNode* q) {
    if (!p && !q) return true;
    if (!p || !q || p->val != q->val) return false;
    return isSame(p->left, q->left) && isSame(p->right, q->right);
}

bool isSubtree(TreeNode* root, TreeNode* subRoot) {
    if (!root) return false;
    if (isSame(root, subRoot)) return true;
    return isSubtree(root->left, subRoot) || isSubtree(root->right, subRoot);
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int n, m;
    if (!(cin >> n)) return 0;
    vector<string> rTokens(n);
    for (int i = 0; i < n; ++i) cin >> rTokens[i];

    if (!(cin >> m)) return 0;
    vector<string> sTokens(m);
    for (int i = 0; i < m; ++i) cin >> sTokens[i];

    TreeNode* root = buildTree(rTokens);
    TreeNode* subRoot = buildTree(sTokens);

    cout << (isSubtree(root, subRoot) ? "true" : "false") << "\\n";
    return 0;
}
`,
  },

  'lowest-common-ancestor-of-a-bst': {
    python: `import sys
from collections import deque

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def build_tree(tokens):
    if not tokens:
        return None
    root = TreeNode(int(tokens[0]))
    q = deque([root])
    i = 1
    while q and i < len(tokens):
        node = q.popleft()
        if i < len(tokens) and tokens[i] != 'null':
            node.left = TreeNode(int(tokens[i]))
            q.append(node.left)
        i += 1
        if i < len(tokens) and tokens[i] != 'null':
            node.right = TreeNode(int(tokens[i]))
            q.append(node.right)
        i += 1
    return root

def solve():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    n = int(tokens[0])
    tree_tokens = tokens[1:1 + n]
    p = int(tokens[1 + n])
    q = int(tokens[2 + n])

    root = build_tree(tree_tokens)
    curr = root
    while curr:
        if p < curr.val and q < curr.val:
            curr = curr.left
        elif p > curr.val and q > curr.val:
            curr = curr.right
        else:
            print(curr.val)
            return

if __name__ == '__main__':
    solve()
`,
    cpp: `#include <iostream>
#include <vector>
#include <string>
#include <queue>

using namespace std;

struct TreeNode {
    long long val;
    TreeNode* left;
    TreeNode* right;
    TreeNode(long long v) : val(v), left(nullptr), right(nullptr) {}
};

TreeNode* buildTree(const vector<string>& tokens) {
    if (tokens.empty()) return nullptr;
    TreeNode* root = new TreeNode(stoll(tokens[0]));
    queue<TreeNode*> q;
    q.push(root);
    size_t i = 1;
    while (!q.empty() && i < tokens.size()) {
        TreeNode* curr = q.front(); q.pop();
        if (i < tokens.size() && tokens[i] != "null") {
            curr->left = new TreeNode(stoll(tokens[i]));
            q.push(curr->left);
        }
        i++;
        if (i < tokens.size() && tokens[i] != "null") {
            curr->right = new TreeNode(stoll(tokens[i]));
            q.push(curr->right);
        }
        i++;
    }
    return root;
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int n;
    if (!(cin >> n)) return 0;

    vector<string> tokens(n);
    for (int i = 0; i < n; ++i) cin >> tokens[i];

    long long p, qVal;
    cin >> p >> qVal;

    TreeNode* root = buildTree(tokens);
    TreeNode* curr = root;

    while (curr) {
        if (p < curr->val && qVal < curr->val) {
            curr = curr->left;
        } else if (p > curr->val && qVal > curr->val) {
            curr = curr->right;
        } else {
            cout << curr->val << "\\n";
            return 0;
        }
    }

    return 0;
}
`,
  },

  'binary-tree-level-order-traversal': {
    python: `import sys
from collections import deque

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def build_tree(tokens):
    if not tokens:
        return None
    root = TreeNode(tokens[0])
    q = deque([root])
    i = 1
    while q and i < len(tokens):
        node = q.popleft()
        if i < len(tokens) and tokens[i] != 'null':
            node.left = TreeNode(tokens[i])
            q.append(node.left)
        i += 1
        if i < len(tokens) and tokens[i] != 'null':
            node.right = TreeNode(tokens[i])
            q.append(node.right)
        i += 1
    return root

def solve():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    n = int(tokens[0])
    if n == 0:
        return
    tree_tokens = tokens[1:1 + n]
    root = build_tree(tree_tokens)

    if not root:
        return

    q = deque([root])
    while q:
        level_size = len(q)
        level_vals = []
        for _ in range(level_size):
            node = q.popleft()
            level_vals.append(node.val)
            if node.left:
                q.append(node.left)
            if node.right:
                q.append(node.right)
        print(" ".join(level_vals))

if __name__ == '__main__':
    solve()
`,
    cpp: `#include <iostream>
#include <vector>
#include <string>
#include <queue>

using namespace std;

struct TreeNode {
    string val;
    TreeNode* left;
    TreeNode* right;
    TreeNode(string v) : val(v), left(nullptr), right(nullptr) {}
};

TreeNode* buildTree(const vector<string>& tokens) {
    if (tokens.empty()) return nullptr;
    TreeNode* root = new TreeNode(tokens[0]);
    queue<TreeNode*> q;
    q.push(root);
    size_t i = 1;
    while (!q.empty() && i < tokens.size()) {
        TreeNode* curr = q.front(); q.pop();
        if (i < tokens.size() && tokens[i] != "null") {
            curr->left = new TreeNode(tokens[i]);
            q.push(curr->left);
        }
        i++;
        if (i < tokens.size() && tokens[i] != "null") {
            curr->right = new TreeNode(tokens[i]);
            q.push(curr->right);
        }
        i++;
    }
    return root;
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int n;
    if (!(cin >> n) || n <= 0) return 0;

    vector<string> tokens(n);
    for (int i = 0; i < n; ++i) cin >> tokens[i];

    TreeNode* root = buildTree(tokens);
    if (!root) return 0;

    queue<TreeNode*> q;
    q.push(root);

    while (!q.empty()) {
        size_t sz = q.size();
        for (size_t i = 0; i < sz; ++i) {
            TreeNode* curr = q.front(); q.pop();
            cout << curr->val << (i + 1 == sz ? "" : " ");
            if (curr->left) q.push(curr->left);
            if (curr->right) q.push(curr->right);
        }
        cout << "\\n";
    }

    return 0;
}
`,
  },

  'binary-tree-right-side-view': {
    python: `import sys
from collections import deque

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def build_tree(tokens):
    if not tokens:
        return None
    root = TreeNode(tokens[0])
    q = deque([root])
    i = 1
    while q and i < len(tokens):
        node = q.popleft()
        if i < len(tokens) and tokens[i] != 'null':
            node.left = TreeNode(tokens[i])
            q.append(node.left)
        i += 1
        if i < len(tokens) and tokens[i] != 'null':
            node.right = TreeNode(tokens[i])
            q.append(node.right)
        i += 1
    return root

def solve():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    n = int(tokens[0])
    if n == 0:
        return
    tree_tokens = tokens[1:1 + n]
    root = build_tree(tree_tokens)

    if not root:
        return

    q = deque([root])
    res = []

    while q:
        level_size = len(q)
        for i in range(level_size):
            node = q.popleft()
            if i == level_size - 1:
                res.append(node.val)
            if node.left:
                q.append(node.left)
            if node.right:
                q.append(node.right)

    print(" ".join(res))

if __name__ == '__main__':
    solve()
`,
    cpp: `#include <iostream>
#include <vector>
#include <string>
#include <queue>

using namespace std;

struct TreeNode {
    string val;
    TreeNode* left;
    TreeNode* right;
    TreeNode(string v) : val(v), left(nullptr), right(nullptr) {}
};

TreeNode* buildTree(const vector<string>& tokens) {
    if (tokens.empty()) return nullptr;
    TreeNode* root = new TreeNode(tokens[0]);
    queue<TreeNode*> q;
    q.push(root);
    size_t i = 1;
    while (!q.empty() && i < tokens.size()) {
        TreeNode* curr = q.front(); q.pop();
        if (i < tokens.size() && tokens[i] != "null") {
            curr->left = new TreeNode(tokens[i]);
            q.push(curr->left);
        }
        i++;
        if (i < tokens.size() && tokens[i] != "null") {
            curr->right = new TreeNode(tokens[i]);
            q.push(curr->right);
        }
        i++;
    }
    return root;
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int n;
    if (!(cin >> n) || n <= 0) return 0;

    vector<string> tokens(n);
    for (int i = 0; i < n; ++i) cin >> tokens[i];

    TreeNode* root = buildTree(tokens);
    if (!root) return 0;

    queue<TreeNode*> q;
    q.push(root);
    vector<string> res;

    while (!q.empty()) {
        size_t sz = q.size();
        for (size_t i = 0; i < sz; ++i) {
            TreeNode* curr = q.front(); q.pop();
            if (i == sz - 1) {
                res.push_back(curr->val);
            }
            if (curr->left) q.push(curr->left);
            if (curr->right) q.push(curr->right);
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

  'count-good-nodes-in-binary-tree': {
    python: `import sys
from collections import deque

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def build_tree(tokens):
    if not tokens:
        return None
    root = TreeNode(int(tokens[0]))
    q = deque([root])
    i = 1
    while q and i < len(tokens):
        node = q.popleft()
        if i < len(tokens) and tokens[i] != 'null':
            node.left = TreeNode(int(tokens[i]))
            q.append(node.left)
        i += 1
        if i < len(tokens) and tokens[i] != 'null':
            node.right = TreeNode(int(tokens[i]))
            q.append(node.right)
        i += 1
    return root

def solve():
    tokens = sys.stdin.read().split()
    if not tokens:
        print(0)
        return
    n = int(tokens[0])
    if n == 0:
        print(0)
        return
    tree_tokens = tokens[1:1 + n]
    root = build_tree(tree_tokens)

    count = 0
    def dfs(node, max_val):
        nonlocal count
        if not node:
            return
        if node.val >= max_val:
            count += 1
            max_val = node.val
        dfs(node.left, max_val)
        dfs(node.right, max_val)

    if root:
        dfs(root, root.val)

    print(count)

if __name__ == '__main__':
    solve()
`,
    cpp: `#include <iostream>
#include <vector>
#include <string>
#include <queue>
#include <algorithm>

using namespace std;

struct TreeNode {
    long long val;
    TreeNode* left;
    TreeNode* right;
    TreeNode(long long v) : val(v), left(nullptr), right(nullptr) {}
};

TreeNode* buildTree(const vector<string>& tokens) {
    if (tokens.empty()) return nullptr;
    TreeNode* root = new TreeNode(stoll(tokens[0]));
    queue<TreeNode*> q;
    q.push(root);
    size_t i = 1;
    while (!q.empty() && i < tokens.size()) {
        TreeNode* curr = q.front(); q.pop();
        if (i < tokens.size() && tokens[i] != "null") {
            curr->left = new TreeNode(stoll(tokens[i]));
            q.push(curr->left);
        }
        i++;
        if (i < tokens.size() && tokens[i] != "null") {
            curr->right = new TreeNode(stoll(tokens[i]));
            q.push(curr->right);
        }
        i++;
    }
    return root;
}

void dfs(TreeNode* node, long long maxVal, int& count) {
    if (!node) return;
    if (node->val >= maxVal) {
        count++;
        maxVal = node->val;
    }
    dfs(node->left, maxVal, count);
    dfs(node->right, maxVal, count);
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int n;
    if (!(cin >> n) || n <= 0) {
        cout << 0 << "\\n";
        return 0;
    }

    vector<string> tokens(n);
    for (int i = 0; i < n; ++i) cin >> tokens[i];

    TreeNode* root = buildTree(tokens);
    int count = 0;
    if (root) {
        dfs(root, root->val, count);
    }

    cout << count << "\\n";
    return 0;
}
`,
  },

  'validate-binary-search-tree': {
    python: `import sys
from collections import deque

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def build_tree(tokens):
    if not tokens:
        return None
    root = TreeNode(int(tokens[0]))
    q = deque([root])
    i = 1
    while q and i < len(tokens):
        node = q.popleft()
        if i < len(tokens) and tokens[i] != 'null':
            node.left = TreeNode(int(tokens[i]))
            q.append(node.left)
        i += 1
        if i < len(tokens) and tokens[i] != 'null':
            node.right = TreeNode(int(tokens[i]))
            q.append(node.right)
        i += 1
    return root

def validate(node, low, high):
    if not node:
        return True
    if not (low < node.val < high):
        return False
    return validate(node.left, low, node.val) and validate(node.right, node.val, high)

def solve():
    tokens = sys.stdin.read().split()
    if not tokens:
        print("true")
        return
    n = int(tokens[0])
    if n == 0:
        print("true")
        return
    tree_tokens = tokens[1:1 + n]
    root = build_tree(tree_tokens)
    print("true" if validate(root, float('-inf'), float('inf')) else "false")

if __name__ == '__main__':
    solve()
`,
    cpp: `#include <iostream>
#include <vector>
#include <string>
#include <queue>
#include <climits>

using namespace std;

struct TreeNode {
    long long val;
    TreeNode* left;
    TreeNode* right;
    TreeNode(long long v) : val(v), left(nullptr), right(nullptr) {}
};

TreeNode* buildTree(const vector<string>& tokens) {
    if (tokens.empty()) return nullptr;
    TreeNode* root = new TreeNode(stoll(tokens[0]));
    queue<TreeNode*> q;
    q.push(root);
    size_t i = 1;
    while (!q.empty() && i < tokens.size()) {
        TreeNode* curr = q.front(); q.pop();
        if (i < tokens.size() && tokens[i] != "null") {
            curr->left = new TreeNode(stoll(tokens[i]));
            q.push(curr->left);
        }
        i++;
        if (i < tokens.size() && tokens[i] != "null") {
            curr->right = new TreeNode(stoll(tokens[i]));
            q.push(curr->right);
        }
        i++;
    }
    return root;
}

bool validate(TreeNode* node, long long low, long long high) {
    if (!node) return true;
    if (node->val <= low || node->val >= high) return false;
    return validate(node->left, low, node->val) && validate(node->right, node->val, high);
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int n;
    if (!(cin >> n) || n <= 0) {
        cout << "true\\n";
        return 0;
    }

    vector<string> tokens(n);
    for (int i = 0; i < n; ++i) cin >> tokens[i];

    TreeNode* root = buildTree(tokens);
    cout << (validate(root, LLONG_MIN, LLONG_MAX) ? "true" : "false") << "\\n";
    return 0;
}
`,
  },

  'kth-smallest-element-in-a-bst': {
    python: `import sys
from collections import deque

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def build_tree(tokens):
    if not tokens:
        return None
    root = TreeNode(int(tokens[0]))
    q = deque([root])
    i = 1
    while q and i < len(tokens):
        node = q.popleft()
        if i < len(tokens) and tokens[i] != 'null':
            node.left = TreeNode(int(tokens[i]))
            q.append(node.left)
        i += 1
        if i < len(tokens) and tokens[i] != 'null':
            node.right = TreeNode(int(tokens[i]))
            q.append(node.right)
        i += 1
    return root

def solve():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    n = int(tokens[0])
    k = int(tokens[1])
    tree_tokens = tokens[2:2 + n]
    root = build_tree(tree_tokens)

    ans = None
    count = 0
    def inorder(node):
        nonlocal ans, count
        if not node or ans is not None:
            return
        inorder(node.left)
        count += 1
        if count == k:
            ans = node.val
            return
        inorder(node.right)

    inorder(root)
    print(ans)

if __name__ == '__main__':
    solve()
`,
    cpp: `#include <iostream>
#include <vector>
#include <string>
#include <queue>

using namespace std;

struct TreeNode {
    int val;
    TreeNode* left;
    TreeNode* right;
    TreeNode(int v) : val(v), left(nullptr), right(nullptr) {}
};

TreeNode* buildTree(const vector<string>& tokens) {
    if (tokens.empty()) return nullptr;
    TreeNode* root = new TreeNode(stoi(tokens[0]));
    queue<TreeNode*> q;
    q.push(root);
    size_t i = 1;
    while (!q.empty() && i < tokens.size()) {
        TreeNode* curr = q.front(); q.pop();
        if (i < tokens.size() && tokens[i] != "null") {
            curr->left = new TreeNode(stoi(tokens[i]));
            q.push(curr->left);
        }
        i++;
        if (i < tokens.size() && tokens[i] != "null") {
            curr->right = new TreeNode(stoi(tokens[i]));
            q.push(curr->right);
        }
        i++;
    }
    return root;
}

void inorder(TreeNode* node, int k, int& count, int& ans) {
    if (!node || ans != -1) return;
    inorder(node->left, k, count, ans);
    count++;
    if (count == k) {
        ans = node->val;
        return;
    }
    inorder(node->right, k, count, ans);
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int n, k;
    if (!(cin >> n >> k)) return 0;

    vector<string> tokens(n);
    for (int i = 0; i < n; ++i) cin >> tokens[i];

    TreeNode* root = buildTree(tokens);
    int count = 0, ans = -1;
    inorder(root, k, count, ans);

    cout << ans << "\\n";
    return 0;
}
`,
  },

  'construct-binary-tree-from-preorder-and-inorder': {
    python: `import sys
from collections import deque

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def build(preorder, inorder):
    if not preorder or not inorder:
        return None
    root_val = preorder[0]
    root = TreeNode(root_val)
    mid = inorder.index(root_val)
    root.left = build(preorder[1:1 + mid], inorder[:mid])
    root.right = build(preorder[1 + mid:], inorder[mid + 1:])
    return root

def serialize(root):
    if not root:
        return []
    res = []
    q = deque([root])
    while q:
        node = q.popleft()
        if node:
            res.append(str(node.val))
            q.append(node.left)
            q.append(node.right)
        else:
            res.append('null')
    while res and res[-1] == 'null':
        res.pop()
    return res

def solve():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    n = int(tokens[0])
    preorder = [int(x) for x in tokens[1:1 + n]]
    inorder = [int(x) for x in tokens[1 + n:1 + 2 * n]]

    root = build(preorder, inorder)
    print(" ".join(serialize(root)))

if __name__ == '__main__':
    solve()
`,
    cpp: `#include <iostream>
#include <vector>
#include <string>
#include <queue>
#include <unordered_map>

using namespace std;

struct TreeNode {
    int val;
    TreeNode* left;
    TreeNode* right;
    TreeNode(int v) : val(v), left(nullptr), right(nullptr) {}
};

TreeNode* buildHelper(const vector<int>& preorder, int preStart, int preEnd,
                      const vector<int>& inorder, int inStart, int inEnd,
                      unordered_map<int, int>& inMap) {
    if (preStart > preEnd || inStart > inEnd) return nullptr;

    int rootVal = preorder[preStart];
    TreeNode* root = new TreeNode(rootVal);
    int inIndex = inMap[rootVal];
    int leftLen = inIndex - inStart;

    root->left = buildHelper(preorder, preStart + 1, preStart + leftLen,
                             inorder, inStart, inIndex - 1, inMap);
    root->right = buildHelper(preorder, preStart + leftLen + 1, preEnd,
                              inorder, inIndex + 1, inEnd, inMap);

    return root;
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int n;
    if (!(cin >> n) || n <= 0) return 0;

    vector<int> preorder(n), inorder(n);
    for (int i = 0; i < n; ++i) cin >> preorder[i];
    for (int i = 0; i < n; ++i) cin >> inorder[i];

    unordered_map<int, int> inMap;
    for (int i = 0; i < n; ++i) inMap[inorder[i]] = i;

    TreeNode* root = buildHelper(preorder, 0, n - 1, inorder, 0, n - 1, inMap);

    vector<string> res;
    queue<TreeNode*> q;
    q.push(root);

    while (!q.empty()) {
        TreeNode* curr = q.front(); q.pop();
        if (curr) {
            res.push_back(to_string(curr->val));
            q.push(curr->left);
            q.push(curr->right);
        } else {
            res.push_back("null");
        }
    }
    while (!res.empty() && res.back() == "null") res.pop_back();

    for (size_t i = 0; i < res.size(); ++i) {
        cout << res[i] << (i + 1 == res.size() ? "" : " ");
    }
    cout << "\\n";

    return 0;
}
`,
  },

  'binary-tree-maximum-path-sum': {
    python: `import sys
from collections import deque

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def build_tree(tokens):
    if not tokens:
        return None
    root = TreeNode(int(tokens[0]))
    q = deque([root])
    i = 1
    while q and i < len(tokens):
        node = q.popleft()
        if i < len(tokens) and tokens[i] != 'null':
            node.left = TreeNode(int(tokens[i]))
            q.append(node.left)
        i += 1
        if i < len(tokens) and tokens[i] != 'null':
            node.right = TreeNode(int(tokens[i]))
            q.append(node.right)
        i += 1
    return root

def solve():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    n = int(tokens[0])
    if n == 0:
        return
    tree_tokens = tokens[1:1 + n]
    root = build_tree(tree_tokens)

    max_sum = float('-inf')

    def dfs(node):
        nonlocal max_sum
        if not node:
            return 0
        left_gain = max(dfs(node.left), 0)
        right_gain = max(dfs(node.right), 0)
        max_sum = max(max_sum, node.val + left_gain + right_gain)
        return node.val + max(left_gain, right_gain)

    dfs(root)
    print(max_sum)

if __name__ == '__main__':
    solve()
`,
    cpp: `#include <iostream>
#include <vector>
#include <string>
#include <queue>
#include <algorithm>
#include <climits>

using namespace std;

struct TreeNode {
    long long val;
    TreeNode* left;
    TreeNode* right;
    TreeNode(long long v) : val(v), left(nullptr), right(nullptr) {}
};

TreeNode* buildTree(const vector<string>& tokens) {
    if (tokens.empty()) return nullptr;
    TreeNode* root = new TreeNode(stoll(tokens[0]));
    queue<TreeNode*> q;
    q.push(root);
    size_t i = 1;
    while (!q.empty() && i < tokens.size()) {
        TreeNode* curr = q.front(); q.pop();
        if (i < tokens.size() && tokens[i] != "null") {
            curr->left = new TreeNode(stoll(tokens[i]));
            q.push(curr->left);
        }
        i++;
        if (i < tokens.size() && tokens[i] != "null") {
            curr->right = new TreeNode(stoll(tokens[i]));
            q.push(curr->right);
        }
        i++;
    }
    return root;
}

long long dfs(TreeNode* node, long long& maxSum) {
    if (!node) return 0;
    long long leftGain = max(dfs(node->left, maxSum), 0LL);
    long long rightGain = max(dfs(node->right, maxSum), 0LL);
    maxSum = max(maxSum, node->val + leftGain + rightGain);
    return node->val + max(leftGain, rightGain);
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int n;
    if (!(cin >> n) || n <= 0) return 0;

    vector<string> tokens(n);
    for (int i = 0; i < n; ++i) cin >> tokens[i];

    TreeNode* root = buildTree(tokens);
    long long maxSum = LLONG_MIN;
    dfs(root, maxSum);

    cout << maxSum << "\\n";
    return 0;
}
`,
  },

  'serialize-and-deserialize-binary-tree': {
    python: `import sys

def solve():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    n = int(tokens[0])
    if n == 0:
        return
    tree_tokens = tokens[1:1 + n]
    print(" ".join(tree_tokens))

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

    int n;
    if (!(cin >> n) || n <= 0) return 0;

    for (int i = 0; i < n; ++i) {
        string token;
        cin >> token;
        cout << token << (i + 1 == n ? "" : " ");
    }
    cout << "\\n";

    return 0;
}
`,
  },
};
