import { IProblemModelSolutions } from './types';

export const HEAP_SOLUTIONS: Record<string, IProblemModelSolutions> = {
  'kth-largest-element-in-a-stream': {
    python: `import sys
import heapq

def solve():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    k = int(tokens[0])
    n = int(tokens[1])
    idx = 2
    initial = [int(x) for x in tokens[idx:idx + n]]
    idx += n

    m = int(tokens[idx])
    idx += 1
    adds = [int(x) for x in tokens[idx:idx + m]]

    heap = []
    for x in initial:
        heapq.heappush(heap, x)
        if len(heap) > k:
            heapq.heappop(heap)

    res = []
    for x in adds:
        heapq.heappush(heap, x)
        if len(heap) > k:
            heapq.heappop(heap)
        res.append(heap[0])

    print(" ".join(map(str, res)))

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

    int k, n;
    if (!(cin >> k >> n)) return 0;

    priority_queue<int, vector<int>, greater<int>> minHeap;

    for (int i = 0; i < n; ++i) {
        int x;
        cin >> x;
        minHeap.push(x);
        if ((int)minHeap.size() > k) {
            minHeap.pop();
        }
    }

    int m;
    if (!(cin >> m)) return 0;

    for (int i = 0; i < m; ++i) {
        int x;
        cin >> x;
        minHeap.push(x);
        if ((int)minHeap.size() > k) {
            minHeap.pop();
        }
        cout << minHeap.top() << (i + 1 == m ? "" : " ");
    }
    cout << "\\n";

    return 0;
}
`,
  },

  'last-stone-weight': {
    python: `import sys
import heapq

def solve():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    n = int(tokens[0])
    stones = [-int(x) for x in tokens[1:1 + n]]
    heapq.heapify(stones)

    while len(stones) > 1:
        first = -heapq.heappop(stones)
        second = -heapq.heappop(stones)
        if first != second:
            heapq.heappush(stones, -(first - second))

    print(-stones[0] if stones else 0)

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

    int n;
    if (!(cin >> n)) return 0;

    priority_queue<int> maxHeap;
    for (int i = 0; i < n; ++i) {
        int x;
        cin >> x;
        maxHeap.push(x);
    }

    while (maxHeap.size() > 1) {
        int y = maxHeap.top(); maxHeap.pop();
        int x = maxHeap.top(); maxHeap.pop();
        if (y != x) {
            maxHeap.push(y - x);
        }
    }

    cout << (maxHeap.empty() ? 0 : maxHeap.top()) << "\\n";
    return 0;
}
`,
  },

  'k-closest-points-to-origin': {
    python: `import sys

def solve():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    n = int(tokens[0])
    k = int(tokens[1])
    idx = 2

    points = []
    for _ in range(n):
        x = int(tokens[idx])
        y = int(tokens[idx + 1])
        points.append((x, y))
        idx += 2

    # Sort primarily by distance squared, then x, then y
    points.sort(key=lambda p: (p[0]**2 + p[1]**2, p[0], p[1]))

    for i in range(k):
        print(f"{points[i][0]} {points[i][1]}")

if __name__ == '__main__':
    solve()
`,
    cpp: `#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

struct Point {
    long long x, y, dist;
};

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int n, k;
    if (!(cin >> n >> k)) return 0;

    vector<Point> points(n);
    for (int i = 0; i < n; ++i) {
        cin >> points[i].x >> points[i].y;
        points[i].dist = points[i].x * points[i].x + points[i].y * points[i].y;
    }

    sort(points.begin(), points.end(), [](const Point& a, const Point& b) {
        if (a.dist != b.dist) return a.dist < b.dist;
        if (a.x != b.x) return a.x < b.x;
        return a.y < b.y;
    });

    for (int i = 0; i < k; ++i) {
        cout << points[i].x << " " << points[i].y << "\\n";
    }

    return 0;
}
`,
  },

  'kth-largest-element-in-an-array': {
    python: `import sys
import heapq

def solve():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    n = int(tokens[0])
    k = int(tokens[1])
    nums = [int(x) for x in tokens[2:2 + n]]

    heap = []
    for x in nums:
        heapq.heappush(heap, x)
        if len(heap) > k:
            heapq.heappop(heap)

    print(heap[0])

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

    int n, k;
    if (!(cin >> n >> k)) return 0;

    priority_queue<int, vector<int>, greater<int>> minHeap;
    for (int i = 0; i < n; ++i) {
        int x;
        cin >> x;
        minHeap.push(x);
        if ((int)minHeap.size() > k) {
            minHeap.pop();
        }
    }

    cout << minHeap.top() << "\\n";
    return 0;
}
`,
  },

  'task-scheduler': {
    python: `import sys
from collections import Counter

def solve():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    length = int(tokens[0])
    n = int(tokens[1])
    tasks = tokens[2:2 + length]

    counts = Counter(tasks)
    max_freq = max(counts.values())
    max_count = sum(1 for c in counts.values() if c == max_freq)

    ans = max(length, (max_freq - 1) * (n + 1) + max_count)
    print(ans)

if __name__ == '__main__':
    solve()
`,
    cpp: `#include <iostream>
#include <vector>
#include <string>
#include <algorithm>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int len, n;
    if (!(cin >> len >> n)) return 0;

    int counts[26] = {0};
    int maxFreq = 0;

    for (int i = 0; i < len; ++i) {
        char ch;
        cin >> ch;
        counts[ch - 'A']++;
        if (counts[ch - 'A'] > maxFreq) {
            maxFreq = counts[ch - 'A'];
        }
    }

    int maxCount = 0;
    for (int i = 0; i < 26; ++i) {
        if (counts[i] == maxFreq) {
            maxCount++;
        }
    }

    int ans = max(len, (maxFreq - 1) * (n + 1) + maxCount);
    cout << ans << "\\n";

    return 0;
}
`,
  },

  'design-twitter': {
    python: `import sys
from collections import defaultdict
import heapq

def solve():
    lines = sys.stdin.read().splitlines()
    if not lines:
        return
    q = int(lines[0].strip())

    time = 0
    tweets = defaultdict(list) # user -> list of (time, tweetId)
    following = defaultdict(set) # user -> set of followees

    for i in range(1, q + 1):
        if i >= len(lines):
            break
        parts = lines[i].strip().split()
        if not parts:
            continue
        op = parts[0]
        if op == 'postTweet':
            u = int(parts[1])
            t = int(parts[2])
            time += 1
            tweets[u].append((time, t))
        elif op == 'getNewsFeed':
            u = int(parts[1])
            feed_users = following[u] | {u}
            heap = [] # min heap of size 10 (time, tweetId)
            for user in feed_users:
                for t_time, tweet_id in reversed(tweets[user][-10:]):
                    heapq.heappush(heap, (t_time, tweet_id))
                    if len(heap) > 10:
                        heapq.heappop(heap)
            # sort heap descending by time
            res = [tid for _, tid in sorted(heap, key=lambda x: x[0], reverse=True)]
            print(" ".join(map(str, res)))
        elif op == 'follow':
            f = int(parts[1])
            fe = int(parts[2])
            if f != fe:
                following[f].add(fe)
        elif op == 'unfollow':
            f = int(parts[1])
            fe = int(parts[2])
            following[f].discard(fe)

if __name__ == '__main__':
    solve()
`,
    cpp: `#include <iostream>
#include <vector>
#include <string>
#include <unordered_map>
#include <unordered_set>
#include <queue>
#include <algorithm>

using namespace std;

struct Tweet {
    int time;
    int tweetId;
};

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int q;
    if (!(cin >> q)) return 0;

    int timestamp = 0;
    unordered_map<int, vector<Tweet>> tweets;
    unordered_map<int, unordered_set<int>> following;

    while (q--) {
        string op;
        cin >> op;
        if (op == "postTweet") {
            int u, t;
            cin >> u >> t;
            tweets[u].push_back({++timestamp, t});
        } else if (op == "getNewsFeed") {
            int u;
            cin >> u;
            unordered_set<int> users = following[u];
            users.insert(u);

            // Min heap of up to 10 items
            priority_queue<pair<int, int>, vector<pair<int, int>>, greater<pair<int, int>>> minHeap;

            for (int user : users) {
                const auto& userTweets = tweets[user];
                int start = max(0, (int)userTweets.size() - 10);
                for (int i = (int)userTweets.size() - 1; i >= start; --i) {
                    minHeap.push({userTweets[i].time, userTweets[i].tweetId});
                    if ((int)minHeap.size() > 10) {
                        minHeap.pop();
                    }
                }
            }

            vector<pair<int, int>> sortedTweets;
            while (!minHeap.empty()) {
                sortedTweets.push_back(minHeap.top());
                minHeap.pop();
            }
            reverse(sortedTweets.begin(), sortedTweets.end());

            for (size_t i = 0; i < sortedTweets.size(); ++i) {
                cout << sortedTweets[i].second << (i + 1 == sortedTweets.size() ? "" : " ");
            }
            cout << "\\n";
        } else if (op == "follow") {
            int f, fe;
            cin >> f >> fe;
            if (f != fe) following[f].insert(fe);
        } else if (op == "unfollow") {
            int f, fe;
            cin >> f >> fe;
            following[f].erase(fe);
        }
    }

    return 0;
}
`,
  },

  'find-median-from-data-stream': {
    python: `import sys
import heapq

def solve():
    lines = sys.stdin.read().splitlines()
    if not lines:
        return
    q = int(lines[0].strip())

    small = [] # max-heap (invert values)
    large = [] # min-heap

    for i in range(1, q + 1):
        if i >= len(lines):
            break
        parts = lines[i].strip().split()
        if not parts:
            continue
        op = parts[0]
        if op == 'addNum':
            num = int(parts[1])
            heapq.heappush(small, -num)
            # Ensure small <= large
            if small and large and (-small[0] > large[0]):
                heapq.heappush(large, -heapq.heappop(small))
            # Balance sizes
            if len(small) > len(large) + 1:
                heapq.heappush(large, -heapq.heappop(small))
            if len(large) > len(small):
                heapq.heappush(small, -heapq.heappop(large))
        elif op == 'findMedian':
            if len(small) > len(large):
                med = float(-small[0])
            else:
                med = (-small[0] + large[0]) / 2.0
            print(f"{med:.5f}")

if __name__ == '__main__':
    solve()
`,
    cpp: `#include <iostream>
#include <vector>
#include <string>
#include <queue>
#include <iomanip>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int q;
    if (!(cin >> q)) return 0;

    priority_queue<long long> small; // Max heap
    priority_queue<long long, vector<long long>, greater<long long>> large; // Min heap

    while (q--) {
        string op;
        cin >> op;
        if (op == "addNum") {
            long long num;
            cin >> num;
            small.push(num);

            if (!small.empty() && !large.empty() && (small.top() > large.top())) {
                large.push(small.top());
                small.pop();
            }

            if (small.size() > large.size() + 1) {
                large.push(small.top());
                small.pop();
            }
            if (large.size() > small.size()) {
                small.push(large.top());
                large.pop();
            }
        } else if (op == "findMedian") {
            double med;
            if (small.size() > large.size()) {
                med = (double)small.top();
            } else {
                med = (double)(small.top() + large.top()) / 2.0;
            }
            cout << fixed << setprecision(5) << med << "\\n";
        }
    }

    return 0;
}
`,
  },
};
