import { IProblemModelSolutions } from './types';

export const INTERVALS_SOLUTIONS: Record<string, IProblemModelSolutions> = {
  'insert-interval': {
    python: `import sys

def solve():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    n = int(tokens[0])
    new_start = int(tokens[1])
    new_end = int(tokens[2])
    idx = 3

    intervals = []
    for _ in range(n):
        intervals.append([int(tokens[idx]), int(tokens[idx + 1])])
        idx += 2

    res = []
    i = 0

    # Before newInterval
    while i < n and intervals[i][1] < new_start:
        res.append(intervals[i])
        i += 1

    # Overlapping
    while i < n and intervals[i][0] <= new_end:
        new_start = min(new_start, intervals[i][0])
        new_end = max(new_end, intervals[i][1])
        i += 1
    res.append([new_start, new_end])

    # After newInterval
    while i < n:
        res.append(intervals[i])
        i += 1

    for start, end in res:
        print(f"{start} {end}")

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

    int newStart, newEnd;
    cin >> newStart >> newEnd;

    vector<pair<int, int>> intervals(n);
    for (int i = 0; i < n; ++i) {
        cin >> intervals[i].first >> intervals[i].second;
    }

    vector<pair<int, int>> res;
    int i = 0;

    while (i < n && intervals[i].second < newStart) {
        res.push_back(intervals[i++]);
    }

    while (i < n && intervals[i].first <= newEnd) {
        newStart = min(newStart, intervals[i].first);
        newEnd = max(newEnd, intervals[i].second);
        i++;
    }
    res.push_back({newStart, newEnd});

    while (i < n) {
        res.push_back(intervals[i++]);
    }

    for (const auto& p : res) {
        cout << p.first << " " << p.second << "\\n";
    }

    return 0;
}
`,
  },

  'merge-intervals': {
    python: `import sys

def solve():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    n = int(tokens[0])
    idx = 1
    intervals = []
    for _ in range(n):
        intervals.append([int(tokens[idx]), int(tokens[idx + 1])])
        idx += 2

    intervals.sort(key=lambda x: x[0])
    res = [intervals[0]]

    for i in range(1, n):
        if intervals[i][0] <= res[-1][1]:
            res[-1][1] = max(res[-1][1], intervals[i][1])
        else:
            res.append(intervals[i])

    for start, end in res:
        print(f"{start} {end}")

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

    vector<pair<int, int>> intervals(n);
    for (int i = 0; i < n; ++i) {
        cin >> intervals[i].first >> intervals[i].second;
    }

    sort(intervals.begin(), intervals.end());
    vector<pair<int, int>> res;
    res.push_back(intervals[0]);

    for (int i = 1; i < n; ++i) {
        if (intervals[i].first <= res.back().second) {
            res.back().second = max(res.back().second, intervals[i].second);
        } else {
            res.push_back(intervals[i]);
        }
    }

    for (const auto& p : res) {
        cout << p.first << " " << p.second << "\\n";
    }

    return 0;
}
`,
  },

  'non-overlapping-intervals': {
    python: `import sys

def solve():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    n = int(tokens[0])
    idx = 1
    intervals = []
    for _ in range(n):
        intervals.append((int(tokens[idx]), int(tokens[idx + 1])))
        idx += 2

    intervals.sort(key=lambda x: x[1])

    removals = 0
    prev_end = float('-inf')

    for start, end in intervals:
        if start >= prev_end:
            prev_end = end
        else:
            removals += 1

    print(removals)

if __name__ == '__main__':
    solve()
`,
    cpp: `#include <iostream>
#include <vector>
#include <algorithm>
#include <climits>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int n;
    if (!(cin >> n) || n <= 0) {
        cout << 0 << "\\n";
        return 0;
    }

    vector<pair<int, int>> intervals(n);
    for (int i = 0; i < n; ++i) {
        cin >> intervals[i].first >> intervals[i].second;
    }

    sort(intervals.begin(), intervals.end(), [](const pair<int, int>& a, const pair<int, int>& b) {
        return a.second < b.second;
    });

    int removals = 0;
    int prevEnd = INT_MIN;

    for (const auto& [start, end] : intervals) {
        if (start >= prevEnd) {
            prevEnd = end;
        } else {
            removals++;
        }
    }

    cout << removals << "\\n";
    return 0;
}
`,
  },

  'meeting-rooms': {
    python: `import sys

def solve():
    tokens = sys.stdin.read().split()
    if not tokens:
        print("true")
        return
    n = int(tokens[0])
    if n == 0:
        print("true")
        return

    idx = 1
    intervals = []
    for _ in range(n):
        intervals.append((int(tokens[idx]), int(tokens[idx + 1])))
        idx += 2

    intervals.sort(key=lambda x: x[0])

    for i in range(1, n):
        if intervals[i][0] < intervals[i - 1][1]:
            print("false")
            return

    print("true")

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
    if (!(cin >> n) || n <= 0) {
        cout << "true\\n";
        return 0;
    }

    vector<pair<int, int>> intervals(n);
    for (int i = 0; i < n; ++i) {
        cin >> intervals[i].first >> intervals[i].second;
    }

    sort(intervals.begin(), intervals.end());

    for (int i = 1; i < n; ++i) {
        if (intervals[i].first < intervals[i - 1].second) {
            cout << "false\\n";
            return 0;
        }
    }

    cout << "true\\n";
    return 0;
}
`,
  },

  'meeting-rooms-ii': {
    python: `import sys

def solve():
    tokens = sys.stdin.read().split()
    if not tokens:
        print(0)
        return
    n = int(tokens[0])
    if n == 0:
        print(0)
        return

    idx = 1
    starts = []
    ends = []
    for _ in range(n):
        starts.append(int(tokens[idx]))
        ends.append(int(tokens[idx + 1]))
        idx += 2

    starts.sort()
    ends.sort()

    rooms = 0
    max_rooms = 0
    s_idx, e_idx = 0, 0

    while s_idx < n:
        if starts[s_idx] < ends[e_idx]:
            rooms += 1
            s_idx += 1
            max_rooms = max(max_rooms, rooms)
        else:
            rooms -= 1
            e_idx += 1

    print(max_rooms)

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
    if (!(cin >> n) || n <= 0) {
        cout << 0 << "\\n";
        return 0;
    }

    vector<int> starts(n), ends(n);
    for (int i = 0; i < n; ++i) {
        cin >> starts[i] >> ends[i];
    }

    sort(starts.begin(), starts.end());
    sort(ends.begin(), ends.end());

    int rooms = 0, maxRooms = 0;
    int s = 0, e = 0;

    while (s < n) {
        if (starts[s] < ends[e]) {
            rooms++;
            s++;
            maxRooms = max(maxRooms, rooms);
        } else {
            rooms--;
            e++;
        }
    }

    cout << maxRooms << "\\n";
    return 0;
}
`,
  },

  'minimum-interval-to-include-each-query': {
    python: `import sys
import heapq

def solve():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    n = int(tokens[0])
    q_count = int(tokens[1])
    idx = 2

    intervals = []
    for _ in range(n):
        l = int(tokens[idx])
        r = int(tokens[idx + 1])
        idx += 2
        intervals.append((l, r))

    queries = [int(x) for x in tokens[idx:idx + q_count]]

    intervals.sort(key=lambda x: x[0])
    sorted_q = sorted([(q, i) for i, q in enumerate(queries)])

    res = [-1] * q_count
    pq = [] # (size, right)
    i = 0

    for q, original_idx in sorted_q:
        while i < n and intervals[i][0] <= q:
            l, r = intervals[i]
            heapq.heappush(pq, (r - l + 1, r))
            i += 1

        while pq and pq[0][1] < q:
            heapq.heappop(pq)

        if pq:
            res[original_idx] = pq[0][0]

    print(" ".join(map(str, res)))

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

    int n, qCount;
    if (!(cin >> n >> qCount)) return 0;

    vector<pair<int, int>> intervals(n);
    for (int i = 0; i < n; ++i) {
        cin >> intervals[i].first >> intervals[i].second;
    }

    vector<pair<int, int>> queries(qCount);
    for (int i = 0; i < qCount; ++i) {
        cin >> queries[i].first;
        queries[i].second = i;
    }

    sort(intervals.begin(), intervals.end());
    sort(queries.begin(), queries.end());

    priority_queue<pair<int, int>, vector<pair<int, int>>, greater<pair<int, int>>> pq;
    vector<int> res(qCount, -1);
    int i = 0;

    for (const auto& [q, origIdx] : queries) {
        while (i < n && intervals[i].first <= q) {
            int l = intervals[i].first;
            int r = intervals[i].second;
            pq.push({r - l + 1, r});
            i++;
        }

        while (!pq.empty() && pq.top().second < q) {
            pq.pop();
        }

        if (!pq.empty()) {
            res[origIdx] = pq.top().first;
        }
    }

    for (int j = 0; j < qCount; ++j) {
        cout << res[j] << (j + 1 == qCount ? "" : " ");
    }
    cout << "\\n";

    return 0;
}
`,
  },
};
