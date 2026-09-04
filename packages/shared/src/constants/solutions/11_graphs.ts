import { IProblemModelSolutions } from './types';

export const GRAPHS_SOLUTIONS: Record<string, IProblemModelSolutions> = {
  'number-of-islands': {
    python: `import sys
from collections import deque

def solve():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    m = int(tokens[0])
    n = int(tokens[1])
    idx = 2
    grid = []
    for _ in range(m):
        grid.append(list(tokens[idx:idx + n]))
        idx += n

    islands = 0
    for r in range(m):
        for c in range(n):
            if grid[r][c] == '1':
                islands += 1
                grid[r][c] = '0'
                q = deque([(r, c)])
                while q:
                    curr_r, curr_c = q.popleft()
                    for dr, dc in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                        nr, nc = curr_r + dr, curr_c + dc
                        if 0 <= nr < m and 0 <= nc < n and grid[nr][nc] == '1':
                            grid[nr][nc] = '0'
                            q.append((nr, nc))

    print(islands)

if __name__ == '__main__':
    solve()
`,
    cpp: `#include <iostream>
#include <vector>
#include <queue>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int m, n;
    if (!(cin >> m >> n)) return 0;

    vector<vector<char>> grid(m, vector<char>(n));
    for (int i = 0; i < m; ++i) {
        for (int j = 0; j < n; ++j) {
            cin >> grid[i][j];
        }
    }

    int islands = 0;
    int dr[4] = {-1, 1, 0, 0};
    int dc[4] = {0, 0, -1, 1};

    for (int r = 0; r < m; ++r) {
        for (int c = 0; c < n; ++c) {
            if (grid[r][c] == '1') {
                islands++;
                grid[r][c] = '0';
                queue<pair<int, int>> q;
                q.push({r, c});
                while (!q.empty()) {
                    auto [currR, currC] = q.front(); q.pop();
                    for (int d = 0; d < 4; ++d) {
                        int nr = currR + dr[d];
                        int nc = currC + dc[d];
                        if (nr >= 0 && nr < m && nc >= 0 && nc < n && grid[nr][nc] == '1') {
                            grid[nr][nc] = '0';
                            q.push({nr, nc});
                        }
                    }
                }
            }
        }
    }

    cout << islands << "\\n";
    return 0;
}
`,
  },

  'clone-graph': {
    python: `import sys

def solve():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    n = int(tokens[0])
    if n == 0:
        return

    idx = 1
    adj = []
    for _ in range(n):
        k = int(tokens[idx])
        idx += 1
        neighbors = tokens[idx:idx + k]
        idx += k
        adj.append(f"{k} " + " ".join(neighbors) if k > 0 else "0")

    for line in adj:
        print(line)

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
        int k;
        cin >> k;
        cout << k;
        for (int j = 0; j < k; ++j) {
            int neighbor;
            cin >> neighbor;
            cout << " " << neighbor;
        }
        cout << "\\n";
    }

    return 0;
}
`,
  },

  'max-area-of-island': {
    python: `import sys
from collections import deque

def solve():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    m = int(tokens[0])
    n = int(tokens[1])
    idx = 2
    grid = []
    for _ in range(m):
        grid.append([int(x) for x in tokens[idx:idx + n]])
        idx += n

    max_area = 0
    for r in range(m):
        for c in range(n):
            if grid[r][c] == 1:
                area = 0
                grid[r][c] = 0
                q = deque([(r, c)])
                while q:
                    curr_r, curr_c = q.popleft()
                    area += 1
                    for dr, dc in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                        nr, nc = curr_r + dr, curr_c + dc
                        if 0 <= nr < m and 0 <= nc < n and grid[nr][nc] == 1:
                            grid[nr][nc] = 0
                            q.append((nr, nc))
                max_area = max(max_area, area)

    print(max_area)

if __name__ == '__main__':
    solve()
`,
    cpp: `#include <iostream>
#include <vector>
#include <queue>
#include <algorithm>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int m, n;
    if (!(cin >> m >> n)) return 0;

    vector<vector<int>> grid(m, vector<int>(n));
    for (int i = 0; i < m; ++i) {
        for (int j = 0; j < n; ++j) {
            cin >> grid[i][j];
        }
    }

    int maxArea = 0;
    int dr[4] = {-1, 1, 0, 0};
    int dc[4] = {0, 0, -1, 1};

    for (int r = 0; r < m; ++r) {
        for (int c = 0; c < n; ++c) {
            if (grid[r][c] == 1) {
                int area = 0;
                grid[r][c] = 0;
                queue<pair<int, int>> q;
                q.push({r, c});

                while (!q.empty()) {
                    auto [currR, currC] = q.front(); q.pop();
                    area++;

                    for (int d = 0; d < 4; ++d) {
                        int nr = currR + dr[d];
                        int nc = currC + dc[d];
                        if (nr >= 0 && nr < m && nc >= 0 && nc < n && grid[nr][nc] == 1) {
                            grid[nr][nc] = 0;
                            q.push({nr, nc});
                        }
                    }
                }
                maxArea = max(maxArea, area);
            }
        }
    }

    cout << maxArea << "\\n";
    return 0;
}
`,
  },

  'pacific-atlantic-water-flow': {
    python: `import sys
from collections import deque

def solve():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    m = int(tokens[0])
    n = int(tokens[1])
    idx = 2
    heights = []
    for _ in range(m):
        heights.append([int(x) for x in tokens[idx:idx + n]])
        idx += n

    pac = set()
    atl = set()

    def bfs(starts, visited):
        q = deque(starts)
        for r, c in starts:
            visited.add((r, c))
        while q:
            r, c = q.popleft()
            for dr, dc in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                nr, nc = r + dr, c + dc
                if 0 <= nr < m and 0 <= nc < n and (nr, nc) not in visited:
                    if heights[nr][nc] >= heights[r][c]:
                        visited.add((nr, nc))
                        q.append((nr, nc))

    pac_starts = [(0, c) for c in range(n)] + [(r, 0) for r in range(m)]
    atl_starts = [(m - 1, c) for c in range(n)] + [(r, n - 1) for r in range(m)]

    bfs(pac_starts, pac)
    bfs(atl_starts, atl)

    both = sorted(list(pac & atl))
    for r, c in both:
        print(f"{r} {c}")

if __name__ == '__main__':
    solve()
`,
    cpp: `#include <iostream>
#include <vector>
#include <queue>
#include <algorithm>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int m, n;
    if (!(cin >> m >> n)) return 0;

    vector<vector<int>> heights(m, vector<int>(n));
    for (int i = 0; i < m; ++i) {
        for (int j = 0; j < n; ++j) {
            cin >> heights[i][j];
        }
    }

    vector<vector<bool>> pac(m, vector<bool>(n, false));
    vector<vector<bool>> atl(m, vector<bool>(n, false));

    queue<pair<int, int>> qPac, qAtl;

    for (int i = 0; i < m; ++i) {
        pac[i][0] = true;
        qPac.push({i, 0});
        atl[i][n - 1] = true;
        qAtl.push({i, n - 1});
    }
    for (int j = 0; j < n; ++j) {
        pac[0][j] = true;
        qPac.push({0, j});
        atl[m - 1][j] = true;
        qAtl.push({m - 1, j});
    }

    int dr[4] = {-1, 1, 0, 0};
    int dc[4] = {0, 0, -1, 1};

    auto bfs = [&](queue<pair<int, int>>& q, vector<vector<bool>>& visited) {
        while (!q.empty()) {
            auto [r, c] = q.front(); q.pop();
            for (int d = 0; d < 4; ++d) {
                int nr = r + dr[d];
                int nc = c + dc[d];
                if (nr >= 0 && nr < m && nc >= 0 && nc < n && !visited[nr][nc]) {
                    if (heights[nr][nc] >= heights[r][c]) {
                        visited[nr][nc] = true;
                        q.push({nr, nc});
                    }
                }
            }
        }
    };

    bfs(qPac, pac);
    bfs(qAtl, atl);

    for (int r = 0; r < m; ++r) {
        for (int c = 0; c < n; ++c) {
            if (pac[r][c] && atl[r][c]) {
                cout << r << " " << c << "\\n";
            }
        }
    }

    return 0;
}
`,
  },

  'surrounded-regions': {
    python: `import sys
from collections import deque

def solve():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    m = int(tokens[0])
    n = int(tokens[1])
    idx = 2
    board = []
    for _ in range(m):
        board.append(list(tokens[idx:idx + n]))
        idx += n

    q = deque()
    for r in range(m):
        for c in range(n):
            if (r in (0, m - 1) or c in (0, n - 1)) and board[r][c] == 'O':
                board[r][c] = 'E'
                q.append((r, c))

    while q:
        r, c = q.popleft()
        for dr, dc in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
            nr, nc = r + dr, c + dc
            if 0 <= nr < m and 0 <= nc < n and board[nr][nc] == 'O':
                board[nr][nc] = 'E'
                q.append((nr, nc))

    for r in range(m):
        for c in range(n):
            if board[r][c] == 'O':
                board[r][c] = 'X'
            elif board[r][c] == 'E':
                board[r][c] = 'O'
        print(" ".join(board[r]))

if __name__ == '__main__':
    solve()
`,
    cpp: `#include <iostream>
#include <vector>
#include <queue>

using namespace std;

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

    queue<pair<int, int>> q;
    for (int r = 0; r < m; ++r) {
        for (int c = 0; c < n; ++c) {
            if ((r == 0 || r == m - 1 || c == 0 || c == n - 1) && board[r][c] == 'O') {
                board[r][c] = 'E';
                q.push({r, c});
            }
        }
    }

    int dr[4] = {-1, 1, 0, 0};
    int dc[4] = {0, 0, -1, 1};

    while (!q.empty()) {
        auto [r, c] = q.front(); q.pop();
        for (int d = 0; d < 4; ++d) {
            int nr = r + dr[d];
            int nc = c + dc[d];
            if (nr >= 0 && nr < m && nc >= 0 && nc < n && board[nr][nc] == 'O') {
                board[nr][nc] = 'E';
                q.push({nr, nc});
            }
        }
    }

    for (int r = 0; r < m; ++r) {
        for (int c = 0; c < n; ++c) {
            if (board[r][c] == 'O') board[r][c] = 'X';
            else if (board[r][c] == 'E') board[r][c] = 'O';
            cout << board[r][c] << (c + 1 == n ? "" : " ");
        }
        cout << "\\n";
    }

    return 0;
}
`,
  },

  'rotting-oranges': {
    python: `import sys
from collections import deque

def solve():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    m = int(tokens[0])
    n = int(tokens[1])
    idx = 2
    grid = []
    for _ in range(m):
        grid.append([int(x) for x in tokens[idx:idx + n]])
        idx += n

    q = deque()
    fresh = 0
    for r in range(m):
        for c in range(n):
            if grid[r][c] == 2:
                q.append((r, c, 0))
            elif grid[r][c] == 1:
                fresh += 1

    time = 0
    while q:
        r, c, t = q.popleft()
        time = max(time, t)
        for dr, dc in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
            nr, nc = r + dr, c + dc
            if 0 <= nr < m and 0 <= nc < n and grid[nr][nc] == 1:
                grid[nr][nc] = 2
                fresh -= 1
                q.append((nr, nc, t + 1))

    print(time if fresh == 0 else -1)

if __name__ == '__main__':
    solve()
`,
    cpp: `#include <iostream>
#include <vector>
#include <queue>
#include <tuple>
#include <algorithm>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int m, n;
    if (!(cin >> m >> n)) return 0;

    vector<vector<int>> grid(m, vector<int>(n));
    queue<tuple<int, int, int>> q;
    int fresh = 0;

    for (int i = 0; i < m; ++i) {
        for (int j = 0; j < n; ++j) {
            cin >> grid[i][j];
            if (grid[i][j] == 2) q.push({i, j, 0});
            else if (grid[i][j] == 1) fresh++;
        }
    }

    int time = 0;
    int dr[4] = {-1, 1, 0, 0};
    int dc[4] = {0, 0, -1, 1};

    while (!q.empty()) {
        auto [r, c, t] = q.front(); q.pop();
        time = max(time, t);

        for (int d = 0; d < 4; ++d) {
            int nr = r + dr[d];
            int nc = c + dc[d];
            if (nr >= 0 && nr < m && nc >= 0 && nc < n && grid[nr][nc] == 1) {
                grid[nr][nc] = 2;
                fresh--;
                q.push({nr, nc, t + 1});
            }
        }
    }

    cout << (fresh == 0 ? time : -1) << "\\n";
    return 0;
}
`,
  },

  'walls-and-gates': {
    python: `import sys
from collections import deque

def solve():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    m = int(tokens[0])
    n = int(tokens[1])
    idx = 2
    grid = []
    for _ in range(m):
        grid.append([int(x) for x in tokens[idx:idx + n]])
        idx += n

    q = deque()
    for r in range(m):
        for c in range(n):
            if grid[r][c] == 0:
                q.append((r, c))

    INF = 2147483647
    while q:
        r, c = q.popleft()
        for dr, dc in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
            nr, nc = r + dr, c + dc
            if 0 <= nr < m and 0 <= nc < n and grid[nr][nc] == INF:
                grid[nr][nc] = grid[r][c] + 1
                q.append((nr, nc))

    for r in range(m):
        print(" ".join(map(str, grid[r])))

if __name__ == '__main__':
    solve()
`,
    cpp: `#include <iostream>
#include <vector>
#include <queue>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int m, n;
    if (!(cin >> m >> n)) return 0;

    const int INF = 2147483647;
    vector<vector<int>> grid(m, vector<int>(n));
    queue<pair<int, int>> q;

    for (int i = 0; i < m; ++i) {
        for (int j = 0; j < n; ++j) {
            cin >> grid[i][j];
            if (grid[i][j] == 0) {
                q.push({i, j});
            }
        }
    }

    int dr[4] = {-1, 1, 0, 0};
    int dc[4] = {0, 0, -1, 1};

    while (!q.empty()) {
        auto [r, c] = q.front(); q.pop();
        for (int d = 0; d < 4; ++d) {
            int nr = r + dr[d];
            int nc = c + dc[d];
            if (nr >= 0 && nr < m && nc >= 0 && nc < n && grid[nr][nc] == INF) {
                grid[nr][nc] = grid[r][c] + 1;
                q.push({nr, nc});
            }
        }
    }

    for (int r = 0; r < m; ++r) {
        for (int c = 0; c < n; ++c) {
            cout << grid[r][c] << (c + 1 == n ? "" : " ");
        }
        cout << "\\n";
    }

    return 0;
}
`,
  },

  'course-schedule': {
    python: `import sys
from collections import deque

def solve():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    num_courses = int(tokens[0])
    m = int(tokens[1])
    idx = 2

    adj = [[] for _ in range(num_courses)]
    in_degree = [0] * num_courses

    for _ in range(m):
        a = int(tokens[idx])
        b = int(tokens[idx + 1])
        idx += 2
        adj[b].append(a)
        in_degree[a] += 1

    q = deque([i for i in range(num_courses) if in_degree[i] == 0])
    count = 0

    while q:
        u = q.popleft()
        count += 1
        for v in adj[u]:
            in_degree[v] -= 1
            if in_degree[v] == 0:
                q.append(v)

    print("true" if count == num_courses else "false")

if __name__ == '__main__':
    solve()
`,
    cpp: `#include <iostream>
#include <vector>
#include <queue>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int numCourses, m;
    if (!(cin >> numCourses >> m)) return 0;

    vector<vector<int>> adj(numCourses);
    vector<int> inDegree(numCourses, 0);

    for (int i = 0; i < m; ++i) {
        int a, b;
        cin >> a >> b;
        adj[b].push_back(a);
        inDegree[a]++;
    }

    queue<int> q;
    for (int i = 0; i < numCourses; ++i) {
        if (inDegree[i] == 0) q.push(i);
    }

    int count = 0;
    while (!q.empty()) {
        int u = q.front(); q.pop();
        count++;
        for (int v : adj[u]) {
            if (--inDegree[v] == 0) {
                q.push(v);
            }
        }
    }

    cout << (count == numCourses ? "true" : "false") << "\\n";
    return 0;
}
`,
  },

  'course-schedule-ii': {
    python: `import sys
from collections import deque

def solve():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    num_courses = int(tokens[0])
    m = int(tokens[1])
    idx = 2

    adj = [[] for _ in range(num_courses)]
    in_degree = [0] * num_courses

    for _ in range(m):
        a = int(tokens[idx])
        b = int(tokens[idx + 1])
        idx += 2
        adj[b].append(a)
        in_degree[a] += 1

    q = deque([i for i in range(num_courses) if in_degree[i] == 0])
    order = []

    while q:
        u = q.popleft()
        order.append(u)
        for v in adj[u]:
            in_degree[v] -= 1
            if in_degree[v] == 0:
                q.append(v)

    if len(order) == num_courses:
        print(" ".join(map(str, order)))

if __name__ == '__main__':
    solve()
`,
    cpp: `#include <iostream>
#include <vector>
#include <queue>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int numCourses, m;
    if (!(cin >> numCourses >> m)) return 0;

    vector<vector<int>> adj(numCourses);
    vector<int> inDegree(numCourses, 0);

    for (int i = 0; i < m; ++i) {
        int a, b;
        cin >> a >> b;
        adj[b].push_back(a);
        inDegree[a]++;
    }

    queue<int> q;
    for (int i = 0; i < numCourses; ++i) {
        if (inDegree[i] == 0) q.push(i);
    }

    vector<int> order;
    while (!q.empty()) {
        int u = q.front(); q.pop();
        order.push_back(u);
        for (int v : adj[u]) {
            if (--inDegree[v] == 0) {
                q.push(v);
            }
        }
    }

    if ((int)order.size() == numCourses) {
        for (int i = 0; i < numCourses; ++i) {
            cout << order[i] << (i + 1 == numCourses ? "" : " ");
        }
        cout << "\\n";
    }

    return 0;
}
`,
  },

  'redundant-connection': {
    python: `import sys

def solve():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    n = int(tokens[0])
    idx = 1

    parent = list(range(n + 1))

    def find(i):
        if parent[i] == i:
            return i
        parent[i] = find(parent[i])
        return parent[i]

    def union(i, j):
        root_i = find(i)
        root_j = find(j)
        if root_i == root_j:
            return False
        parent[root_i] = root_j
        return True

    ans = None
    for _ in range(n):
        u = int(tokens[idx])
        v = int(tokens[idx + 1])
        idx += 2
        if not union(u, v):
            ans = f"{u} {v}"

    if ans:
        print(ans)

if __name__ == '__main__':
    solve()
`,
    cpp: `#include <iostream>
#include <vector>
#include <numeric>

using namespace std;

int findRoot(int i, vector<int>& parent) {
    if (parent[i] == i) return i;
    return parent[i] = findRoot(parent[i], parent);
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int n;
    if (!(cin >> n)) return 0;

    vector<int> parent(n + 1);
    iota(parent.begin(), parent.end(), 0);

    int ansU = -1, ansV = -1;

    for (int i = 0; i < n; ++i) {
        int u, v;
        cin >> u >> v;
        int ru = findRoot(u, parent);
        int rv = findRoot(v, parent);
        if (ru == rv) {
            ansU = u;
            ansV = v;
        } else {
            parent[ru] = rv;
        }
    }

    cout << ansU << " " << ansV << "\\n";
    return 0;
}
`,
  },

  'number-of-connected-components-in-an-undirected-graph': {
    python: `import sys

def solve():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    n = int(tokens[0])
    m = int(tokens[1])
    idx = 2

    parent = list(range(n))

    def find(i):
        if parent[i] == i:
            return i
        parent[i] = find(parent[i])
        return parent[i]

    count = n
    for _ in range(m):
        u = int(tokens[idx])
        v = int(tokens[idx + 1])
        idx += 2
        ru = find(u)
        rv = find(v)
        if ru != rv:
            parent[ru] = rv
            count -= 1

    print(count)

if __name__ == '__main__':
    solve()
`,
    cpp: `#include <iostream>
#include <vector>
#include <numeric>

using namespace std;

int findRoot(int i, vector<int>& parent) {
    if (parent[i] == i) return i;
    return parent[i] = findRoot(parent[i], parent);
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int n, m;
    if (!(cin >> n >> m)) return 0;

    vector<int> parent(n);
    iota(parent.begin(), parent.end(), 0);

    int count = n;
    for (int i = 0; i < m; ++i) {
        int u, v;
        cin >> u >> v;
        int ru = findRoot(u, parent);
        int rv = findRoot(v, parent);
        if (ru != rv) {
            parent[ru] = rv;
            count--;
        }
    }

    cout << count << "\\n";
    return 0;
}
`,
  },

  'graph-valid-tree': {
    python: `import sys

def solve():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    n = int(tokens[0])
    m = int(tokens[1])
    if m != n - 1:
        print("false")
        return

    idx = 2
    parent = list(range(n))

    def find(i):
        if parent[i] == i:
            return i
        parent[i] = find(parent[i])
        return parent[i]

    for _ in range(m):
        u = int(tokens[idx])
        v = int(tokens[idx + 1])
        idx += 2
        ru = find(u)
        rv = find(v)
        if ru == rv:
            print("false")
            return
        parent[ru] = rv

    print("true")

if __name__ == '__main__':
    solve()
`,
    cpp: `#include <iostream>
#include <vector>
#include <numeric>

using namespace std;

int findRoot(int i, vector<int>& parent) {
    if (parent[i] == i) return i;
    return parent[i] = findRoot(parent[i], parent);
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int n, m;
    if (!(cin >> n >> m)) return 0;

    if (m != n - 1) {
        cout << "false\\n";
        return 0;
    }

    vector<int> parent(n);
    iota(parent.begin(), parent.end(), 0);

    for (int i = 0; i < m; ++i) {
        int u, v;
        cin >> u >> v;
        int ru = findRoot(u, parent);
        int rv = findRoot(v, parent);
        if (ru == rv) {
            cout << "false\\n";
            return 0;
        }
        parent[ru] = rv;
    }

    cout << "true\\n";
    return 0;
}
`,
  },

  'word-ladder': {
    python: `import sys
from collections import deque

def solve():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    begin_word = tokens[0]
    end_word = tokens[1]
    n = int(tokens[2])
    word_set = set(tokens[3:3 + n])

    if end_word not in word_set:
        print(0)
        return

    q = deque([(begin_word, 1)])
    visited = {begin_word}

    while q:
        word, dist = q.popleft()
        if word == end_word:
            print(dist)
            return

        for i in range(len(word)):
            for ch in 'abcdefghijklmnopqrstuvwxyz':
                next_word = word[:i] + ch + word[i+1:]
                if next_word in word_set and next_word not in visited:
                    visited.add(next_word)
                    q.append((next_word, dist + 1))

    print(0)

if __name__ == '__main__':
    solve()
`,
    cpp: `#include <iostream>
#include <string>
#include <vector>
#include <unordered_set>
#include <queue>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    string beginWord, endWord;
    int n;
    if (!(cin >> beginWord >> endWord >> n)) return 0;

    unordered_set<string> wordSet;
    for (int i = 0; i < n; ++i) {
        string w;
        cin >> w;
        wordSet.insert(w);
    }

    if (wordSet.find(endWord) == wordSet.end()) {
        cout << 0 << "\\n";
        return 0;
    }

    queue<pair<string, int>> q;
    q.push({beginWord, 1});
    unordered_set<string> visited;
    visited.insert(beginWord);

    while (!q.empty()) {
        auto [word, dist] = q.front(); q.pop();
        if (word == endWord) {
            cout << dist << "\\n";
            return 0;
        }

        string original = word;
        for (size_t i = 0; i < word.length(); ++i) {
            for (char c = 'a'; c <= 'z'; ++c) {
                word[i] = c;
                if (wordSet.count(word) && !visited.count(word)) {
                    visited.insert(word);
                    q.push({word, dist + 1});
                }
            }
            word[i] = original[i];
        }
    }

    cout << 0 << "\\n";
    return 0;
}
`,
  },
};
