import { IProblemModelSolutions } from './types';

export const ADVANCED_GRAPHS_SOLUTIONS: Record<string, IProblemModelSolutions> = {
  'reconstruct-itinerary': {
    python: `import sys
from collections import defaultdict

def solve():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    m = int(tokens[0])
    idx = 1
    adj = defaultdict(list)
    for _ in range(m):
        u = tokens[idx]
        v = tokens[idx + 1]
        idx += 2
        adj[u].append(v)

    for u in adj:
        adj[u].sort(reverse=True)

    route = []
    def dfs(curr):
        while adj[curr]:
            next_node = adj[curr].pop()
            dfs(next_node)
        route.append(curr)

    dfs("JFK")
    print(" ".join(reversed(route)))

if __name__ == '__main__':
    solve()
`,
    cpp: `#include <iostream>
#include <vector>
#include <string>
#include <unordered_map>
#include <algorithm>

using namespace std;

void dfs(const string& curr, unordered_map<string, vector<string>>& adj, vector<string>& route) {
    while (!adj[curr].empty()) {
        string next = adj[curr].back();
        adj[curr].pop_back();
        dfs(next, adj, route);
    }
    route.push_back(curr);
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int m;
    if (!(cin >> m)) return 0;

    unordered_map<string, vector<string>> adj;
    for (int i = 0; i < m; ++i) {
        string u, v;
        cin >> u >> v;
        adj[u].push_back(v);
    }

    for (auto& [k, v] : adj) {
        sort(v.begin(), v.end(), greater<string>());
    }

    vector<string> route;
    dfs("JFK", adj, route);
    reverse(route.begin(), route.end());

    for (size_t i = 0; i < route.size(); ++i) {
        cout << route[i] << (i + 1 == route.size() ? "" : " ");
    }
    cout << "\\n";

    return 0;
}
`,
  },

  'min-cost-to-connect-all-points': {
    python: `import sys

def solve():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    n = int(tokens[0])
    idx = 1
    points = []
    for _ in range(n):
        x = int(tokens[idx])
        y = int(tokens[idx + 1])
        idx += 2
        points.append((x, y))

    if n <= 1:
        print(0)
        return

    # Prim's algorithm
    min_dist = [float('inf')] * n
    visited = [False] * n
    min_dist[0] = 0
    total_cost = 0

    for _ in range(n):
        u = -1
        for i in range(n):
            if not visited[i] and (u == -1 or min_dist[i] < min_dist[u]):
                u = i

        visited[u] = True
        total_cost += min_dist[u]

        for v in range(n):
            if not visited[v]:
                d = abs(points[u][0] - points[v][0]) + abs(points[u][1] - points[v][1])
                if d < min_dist[v]:
                    min_dist[v] = d

    print(total_cost)

if __name__ == '__main__':
    solve()
`,
    cpp: `#include <iostream>
#include <vector>
#include <cmath>
#include <climits>
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

    vector<pair<int, int>> points(n);
    for (int i = 0; i < n; ++i) {
        cin >> points[i].first >> points[i].second;
    }

    vector<int> minDist(n, INT_MAX);
    vector<bool> visited(n, false);
    minDist[0] = 0;
    long long totalCost = 0;

    for (int i = 0; i < n; ++i) {
        int u = -1;
        for (int j = 0; j < n; ++j) {
            if (!visited[j] && (u == -1 || minDist[j] < minDist[u])) {
                u = j;
            }
        }

        visited[u] = true;
        totalCost += minDist[u];

        for (int v = 0; v < n; ++v) {
            if (!visited[v]) {
                int d = abs(points[u].first - points[v].first) + abs(points[u].second - points[v].second);
                if (d < minDist[v]) {
                    minDist[v] = d;
                }
            }
        }
    }

    cout << totalCost << "\\n";
    return 0;
}
`,
  },

  'network-delay-time': {
    python: `import sys
import heapq
from collections import defaultdict

def solve():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    n = int(tokens[0])
    k = int(tokens[1])
    m = int(tokens[2])
    idx = 3

    adj = defaultdict(list)
    for _ in range(m):
        u = int(tokens[idx])
        v = int(tokens[idx + 1])
        w = int(tokens[idx + 2])
        idx += 3
        adj[u].append((v, w))

    dist = {}
    pq = [(0, k)]

    while pq:
        d, u = heapq.heappop(pq)
        if u in dist:
            continue
        dist[u] = d

        for v, w in adj[u]:
            if v not in dist:
                heapq.heappush(pq, (d + w, v))

    if len(dist) == n:
        print(max(dist.values()))
    else:
        print(-1)

if __name__ == '__main__':
    solve()
`,
    cpp: `#include <iostream>
#include <vector>
#include <queue>
#include <algorithm>
#include <climits>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int n, k, m;
    if (!(cin >> n >> k >> m)) return 0;

    vector<vector<pair<int, int>>> adj(n + 1);
    for (int i = 0; i < m; ++i) {
        int u, v, w;
        cin >> u >> v >> w;
        adj[u].push_back({v, w});
    }

    vector<int> dist(n + 1, INT_MAX);
    priority_queue<pair<int, int>, vector<pair<int, int>>, greater<pair<int, int>>> pq;

    dist[k] = 0;
    pq.push({0, k});

    while (!pq.empty()) {
        auto [d, u] = pq.top(); pq.pop();
        if (d > dist[u]) continue;

        for (auto [v, w] : adj[u]) {
            if (dist[u] + w < dist[v]) {
                dist[v] = dist[u] + w;
                pq.push({dist[v], v});
            }
        }
    }

    int maxDelay = 0;
    for (int i = 1; i <= n; ++i) {
        if (dist[i] == INT_MAX) {
            cout << -1 << "\\n";
            return 0;
        }
        maxDelay = max(maxDelay, dist[i]);
    }

    cout << maxDelay << "\\n";
    return 0;
}
`,
  },

  'swim-in-rising-water': {
    python: `import sys
import heapq

def solve():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    n = int(tokens[0])
    idx = 1
    grid = []
    for _ in range(n):
        grid.append([int(x) for x in tokens[idx:idx + n]])
        idx += n

    visited = [[False] * n for _ in range(n)]
    pq = [(grid[0][0], 0, 0)]
    visited[0][0] = True

    while pq:
        d, r, c = heapq.heappop(pq)
        if r == n - 1 and c == n - 1:
            print(d)
            return

        for dr, dc in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
            nr, nc = r + dr, c + dc
            if 0 <= nr < n and 0 <= nc < n and not visited[nr][nc]:
                visited[nr][nc] = True
                heapq.heappush(pq, (max(d, grid[nr][nc]), nr, nc))

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

    int n;
    if (!(cin >> n)) return 0;

    vector<vector<int>> grid(n, vector<int>(n));
    for (int i = 0; i < n; ++i) {
        for (int j = 0; j < n; ++j) {
            cin >> grid[i][j];
        }
    }

    vector<vector<bool>> visited(n, vector<bool>(n, false));
    priority_queue<tuple<int, int, int>, vector<tuple<int, int, int>>, greater<tuple<int, int, int>>> pq;

    pq.push({grid[0][0], 0, 0});
    visited[0][0] = true;

    int dr[4] = {-1, 1, 0, 0};
    int dc[4] = {0, 0, -1, 1};

    while (!pq.empty()) {
        auto [d, r, c] = pq.top(); pq.pop();
        if (r == n - 1 && c == n - 1) {
            cout << d << "\\n";
            return 0;
        }

        for (int i = 0; i < 4; ++i) {
            int nr = r + dr[i];
            int nc = c + dc[i];
            if (nr >= 0 && nr < n && nc >= 0 && nc < n && !visited[nr][nc]) {
                visited[nr][nc] = true;
                pq.push({max(d, grid[nr][nc]), nr, nc});
            }
        }
    }

    return 0;
}
`,
  },

  'alien-dictionary': {
    python: `import sys
from collections import defaultdict, deque

def solve():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    n = int(tokens[0])
    words = tokens[1:1 + n]

    adj = defaultdict(set)
    in_degree = {c: 0 for word in words for c in word}

    for i in range(n - 1):
        w1, w2 = words[i], words[i + 1]
        min_len = min(len(w1), len(w2))
        if len(w1) > len(w2) and w1[:min_len] == w2[:min_len]:
            print("")
            return

        for j in range(min_len):
            if w1[j] != w2[j]:
                if w2[j] not in adj[w1[j]]:
                    adj[w1[j]].add(w2[j])
                    in_degree[w2[j]] += 1
                break

    q = deque([c for c in in_degree if in_degree[c] == 0])
    res = []

    while q:
        c = q.popleft()
        res.append(c)
        for neighbor in adj[c]:
            in_degree[neighbor] -= 1
            if in_degree[neighbor] == 0:
                q.append(neighbor)

    if len(res) == len(in_degree):
        print("".join(res))
    else:
        print("")

if __name__ == '__main__':
    solve()
`,
    cpp: `#include <iostream>
#include <string>
#include <vector>
#include <unordered_map>
#include <unordered_set>
#include <queue>
#include <algorithm>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int n;
    if (!(cin >> n)) return 0;

    vector<string> words(n);
    unordered_map<char, int> inDegree;
    unordered_map<char, unordered_set<char>> adj;

    for (int i = 0; i < n; ++i) {
        cin >> words[i];
        for (char c : words[i]) inDegree[c] = 0;
    }

    for (int i = 0; i < n - 1; ++i) {
        const string& w1 = words[i];
        const string& w2 = words[i + 1];
        size_t minLen = min(w1.length(), w2.length());

        if (w1.length() > w2.length() && w1.substr(0, minLen) == w2.substr(0, minLen)) {
            cout << "\\n";
            return 0;
        }

        for (size_t j = 0; j < minLen; ++j) {
            if (w1[j] != w2[j]) {
                if (!adj[w1[j]].count(w2[j])) {
                    adj[w1[j]].insert(w2[j]);
                    inDegree[w2[j]]++;
                }
                break;
            }
        }
    }

    queue<char> q;
    for (auto [c, deg] : inDegree) {
        if (deg == 0) q.push(c);
    }

    string res = "";
    while (!q.empty()) {
        char c = q.front(); q.pop();
        res += c;
        for (char nextC : adj[c]) {
            if (--inDegree[nextC] == 0) {
                q.push(nextC);
            }
        }
    }

    if (res.length() == inDegree.size()) {
        cout << res << "\\n";
    } else {
        cout << "\\n";
    }

    return 0;
}
`,
  },

  'cheapest-flights-within-k-stops': {
    python: `import sys

def solve():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    n = int(tokens[0])
    src = int(tokens[1])
    dst = int(tokens[2])
    k = int(tokens[3])
    m = int(tokens[4])
    idx = 5

    flights = []
    for _ in range(m):
        u = int(tokens[idx])
        v = int(tokens[idx + 1])
        price = int(tokens[idx + 2])
        idx += 3
        flights.append((u, v, price))

    prices = [float('inf')] * n
    prices[src] = 0

    for _ in range(k + 1):
        temp = list(prices)
        for u, v, w in flights:
            if prices[u] != float('inf') and prices[u] + w < temp[v]:
                temp[v] = prices[u] + w
        prices = temp

    print(prices[dst] if prices[dst] != float('inf') else -1)

if __name__ == '__main__':
    solve()
`,
    cpp: `#include <iostream>
#include <vector>
#include <algorithm>
#include <climits>

using namespace std;

struct Flight {
    int u, v, w;
};

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int n, src, dst, k, m;
    if (!(cin >> n >> src >> dst >> k >> m)) return 0;

    vector<Flight> flights(m);
    for (int i = 0; i < m; ++i) {
        cin >> flights[i].u >> flights[i].v >> flights[i].w;
    }

    vector<long long> prices(n, LLONG_MAX);
    prices[src] = 0;

    for (int i = 0; i <= k; ++i) {
        vector<long long> temp = prices;
        for (const auto& f : flights) {
            if (prices[f.u] != LLONG_MAX && prices[f.u] + f.w < temp[f.v]) {
                temp[f.v] = prices[f.u] + f.w;
            }
        }
        prices = temp;
    }

    cout << (prices[dst] == LLONG_MAX ? -1 : prices[dst]) << "\\n";
    return 0;
}
`,
  },
};
