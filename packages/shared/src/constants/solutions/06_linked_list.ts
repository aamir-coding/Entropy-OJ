import { IProblemModelSolutions } from './types';

export const LINKED_LIST_SOLUTIONS: Record<string, IProblemModelSolutions> = {
  'reverse-linked-list': {
    python: `import sys

def solve():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    n = int(tokens[0])
    if n == 0:
        return
    vals = tokens[1:1 + n]
    print(" ".join(reversed(vals)))

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
    if (!(cin >> n) || n <= 0) return 0;

    vector<int> vals(n);
    for (int i = 0; i < n; ++i) cin >> vals[i];

    for (int i = n - 1; i >= 0; --i) {
        cout << vals[i] << (i == 0 ? "" : " ");
    }
    cout << "\\n";

    return 0;
}
`,
  },

  'merge-two-sorted-lists': {
    python: `import sys

def solve():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    n = int(tokens[0])
    m = int(tokens[1])
    list1 = [int(x) for x in tokens[2:2 + n]]
    list2 = [int(x) for x in tokens[2 + n:2 + n + m]]

    merged = []
    i, j = 0, 0
    while i < n and j < m:
        if list1[i] <= list2[j]:
            merged.append(list1[i])
            i += 1
        else:
            merged.append(list2[j])
            j += 1

    merged.extend(list1[i:])
    merged.extend(list2[j:])

    if merged:
        print(" ".join(map(str, merged)))

if __name__ == '__main__':
    solve()
`,
    cpp: `#include <iostream>
#include <vector>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int n, m;
    if (!(cin >> n >> m)) return 0;

    vector<int> l1(n), l2(m);
    for (int i = 0; i < n; ++i) cin >> l1[i];
    for (int i = 0; i < m; ++i) cin >> l2[i];

    vector<int> res;
    res.reserve(n + m);

    int i = 0, j = 0;
    while (i < n && j < m) {
        if (l1[i] <= l2[j]) {
            res.push_back(l1[i++]);
        } else {
            res.push_back(l2[j++]);
        }
    }
    while (i < n) res.push_back(l1[i++]);
    while (j < m) res.push_back(l2[j++]);

    for (size_t k = 0; k < res.size(); ++k) {
        cout << res[k] << (k + 1 == res.size() ? "" : " ");
    }
    if (!res.empty()) cout << "\\n";

    return 0;
}
`,
  },

  'reorder-list': {
    python: `import sys

def solve():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    n = int(tokens[0])
    nums = [int(x) for x in tokens[1:1 + n]]

    res = []
    left = 0
    right = n - 1

    while left <= right:
        if left == right:
            res.append(nums[left])
            break
        res.append(nums[left])
        res.append(nums[right])
        left += 1
        right -= 1

    print(" ".join(map(str, res)))

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
    if (!(cin >> n) || n <= 0) return 0;

    vector<int> nums(n);
    for (int i = 0; i < n; ++i) cin >> nums[i];

    vector<int> res;
    res.reserve(n);

    int left = 0, right = n - 1;
    while (left <= right) {
        if (left == right) {
            res.push_back(nums[left]);
            break;
        }
        res.push_back(nums[left]);
        res.push_back(nums[right]);
        left++;
        right--;
    }

    for (int i = 0; i < n; ++i) {
        cout << res[i] << (i + 1 == n ? "" : " ");
    }
    cout << "\\n";

    return 0;
}
`,
  },

  'remove-nth-node-from-end-of-list': {
    python: `import sys

def solve():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    length = int(tokens[0])
    n = int(tokens[1])
    vals = [int(x) for x in tokens[2:2 + length]]

    remove_idx = length - n
    vals.pop(remove_idx)

    if vals:
        print(" ".join(map(str, vals)))

if __name__ == '__main__':
    solve()
`,
    cpp: `#include <iostream>
#include <vector>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int length, n;
    if (!(cin >> length >> n)) return 0;

    vector<int> vals(length);
    for (int i = 0; i < length; ++i) cin >> vals[i];

    int removeIdx = length - n;
    bool first = true;
    for (int i = 0; i < length; ++i) {
        if (i == removeIdx) continue;
        if (!first) cout << " ";
        cout << vals[i];
        first = false;
    }
    if (!first) cout << "\\n";

    return 0;
}
`,
  },

  'copy-list-with-random-pointer': {
    python: `import sys

def solve():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    n = int(tokens[0])
    idx = 1
    for _ in range(n):
        val = tokens[idx]
        rnd = tokens[idx + 1]
        idx += 2
        print(f"{val} {rnd}")

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

    for (int i = 0; i < n; ++i) {
        int val, rnd;
        cin >> val >> rnd;
        cout << val << " " << rnd << "\\n";
    }

    return 0;
}
`,
  },

  'add-two-numbers': {
    python: `import sys

def solve():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    n = int(tokens[0])
    m = int(tokens[1])
    l1 = [int(x) for x in tokens[2:2 + n]]
    l2 = [int(x) for x in tokens[2 + n:2 + n + m]]

    res = []
    carry = 0
    i, j = 0, 0

    while i < n or j < m or carry:
        v1 = l1[i] if i < n else 0
        v2 = l2[j] if j < m else 0
        s = v1 + v2 + carry
        carry = s // 10
        res.append(s % 10)
        i += 1
        j += 1

    print(" ".join(map(str, res)))

if __name__ == '__main__':
    solve()
`,
    cpp: `#include <iostream>
#include <vector>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int n, m;
    if (!(cin >> n >> m)) return 0;

    vector<int> l1(n), l2(m);
    for (int i = 0; i < n; ++i) cin >> l1[i];
    for (int i = 0; i < m; ++i) cin >> l2[i];

    vector<int> res;
    int carry = 0;
    int i = 0, j = 0;

    while (i < n || j < m || carry) {
        int v1 = (i < n) ? l1[i] : 0;
        int v2 = (j < m) ? l2[j] : 0;
        int sum = v1 + v2 + carry;
        carry = sum / 10;
        res.push_back(sum % 10);
        i++;
        j++;
    }

    for (size_t k = 0; k < res.size(); ++k) {
        cout << res[k] << (k + 1 == res.size() ? "" : " ");
    }
    cout << "\\n";

    return 0;
}
`,
  },

  'linked-list-cycle': {
    python: `import sys

def solve():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    n = int(tokens[0])
    pos = int(tokens[1])
    print("true" if pos >= 0 else "false")

if __name__ == '__main__':
    solve()
`,
    cpp: `#include <iostream>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int n, pos;
    if (!(cin >> n >> pos)) return 0;

    cout << (pos >= 0 ? "true" : "false") << "\\n";
    return 0;
}
`,
  },

  'find-the-duplicate-number': {
    python: `import sys

def solve():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    length = int(tokens[0])
    nums = [int(x) for x in tokens[1:1 + length]]

    # Floyd's cycle finding algorithm
    slow = nums[0]
    fast = nums[0]

    while True:
        slow = nums[slow]
        fast = nums[nums[fast]]
        if slow == fast:
            break

    slow = nums[0]
    while slow != fast:
        slow = nums[slow]
        fast = nums[fast]

    print(slow)

if __name__ == '__main__':
    solve()
`,
    cpp: `#include <iostream>
#include <vector>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int length;
    if (!(cin >> length)) return 0;

    vector<int> nums(length);
    for (int i = 0; i < length; ++i) cin >> nums[i];

    int slow = nums[0];
    int fast = nums[0];

    do {
        slow = nums[slow];
        fast = nums[nums[fast]];
    } while (slow != fast);

    slow = nums[0];
    while (slow != fast) {
        slow = nums[slow];
        fast = nums[fast];
    }

    cout << slow << "\\n";
    return 0;
}
`,
  },

  'lru-cache': {
    python: `import sys
from collections import OrderedDict

def solve():
    lines = sys.stdin.read().splitlines()
    if not lines:
        return
    first = lines[0].strip().split()
    capacity = int(first[0])
    q = int(first[1])

    cache = OrderedDict()

    for i in range(1, q + 1):
        if i >= len(lines):
            break
        parts = lines[i].strip().split()
        if not parts:
            continue
        op = parts[0]
        if op == 'put':
            key = int(parts[1])
            val = int(parts[2])
            if key in cache:
                cache.move_to_end(key)
            cache[key] = val
            if len(cache) > capacity:
                cache.popitem(last=False)
        elif op == 'get':
            key = int(parts[1])
            if key in cache:
                cache.move_to_end(key)
                print(cache[key])
            else:
                print(-1)

if __name__ == '__main__':
    solve()
`,
    cpp: `#include <iostream>
#include <list>
#include <unordered_map>
#include <string>

using namespace std;

class LRUCache {
    int capacity;
    list<pair<int, int>> lruList; // key, val
    unordered_map<int, list<pair<int, int>>::iterator> cacheMap;

public:
    LRUCache(int cap) : capacity(cap) {}

    int get(int key) {
        auto it = cacheMap.find(key);
        if (it == cacheMap.end()) return -1;
        lruList.splice(lruList.begin(), lruList, it->second);
        return it->second->second;
    }

    void put(int key, int value) {
        auto it = cacheMap.find(key);
        if (it != cacheMap.end()) {
            it->second->second = value;
            lruList.splice(lruList.begin(), lruList, it->second);
            return;
        }

        if ((int)lruList.size() == capacity) {
            int oldKey = lruList.back().first;
            lruList.pop_back();
            cacheMap.erase(oldKey);
        }

        lruList.emplace_front(key, value);
        cacheMap[key] = lruList.begin();
    }
};

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int capacity, q;
    if (!(cin >> capacity >> q)) return 0;

    LRUCache lru(capacity);

    while (q--) {
        string op;
        cin >> op;
        if (op == "put") {
            int k, v;
            cin >> k >> v;
            lru.put(k, v);
        } else if (op == "get") {
            int k;
            cin >> k;
            cout << lru.get(k) << "\\n";
        }
    }

    return 0;
}
`,
  },

  'merge-k-sorted-lists': {
    python: `import sys
import heapq

def solve():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    k = int(tokens[0])
    idx = 1
    heap = [] # (val, list_idx, elem_idx)
    lists = []

    for l_idx in range(k):
        length = int(tokens[idx])
        idx += 1
        sub = [int(x) for x in tokens[idx:idx + length]]
        idx += length
        lists.append(sub)
        if sub:
            heapq.heappush(heap, (sub[0], l_idx, 0))

    res = []
    while heap:
        val, l_idx, elem_idx = heapq.heappop(heap)
        res.append(val)
        if elem_idx + 1 < len(lists[l_idx]):
            next_val = lists[l_idx][elem_idx + 1]
            heapq.heappush(heap, (next_val, l_idx, elem_idx + 1))

    if res:
        print(" ".join(map(str, res)))

if __name__ == '__main__':
    solve()
`,
    cpp: `#include <iostream>
#include <vector>
#include <queue>
#include <tuple>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int k;
    if (!(cin >> k)) return 0;

    vector<vector<int>> lists(k);
    priority_queue<tuple<int, int, int>, vector<tuple<int, int, int>>, greater<tuple<int, int, int>>> pq;

    for (int i = 0; i < k; ++i) {
        int len;
        cin >> len;
        lists[i].resize(len);
        for (int j = 0; j < len; ++j) {
            cin >> lists[i][j];
        }
        if (len > 0) {
            pq.push({lists[i][0], i, 0});
        }
    }

    bool first = true;
    while (!pq.empty()) {
        auto [val, lIdx, eIdx] = pq.top();
        pq.pop();

        if (!first) cout << " ";
        cout << val;
        first = false;

        if (eIdx + 1 < (int)lists[lIdx].size()) {
            pq.push({lists[lIdx][eIdx + 1], lIdx, eIdx + 1});
        }
    }

    if (!first) cout << "\\n";
    return 0;
}
`,
  },

  'reverse-nodes-in-k-group': {
    python: `import sys

def solve():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    n = int(tokens[0])
    k = int(tokens[1])
    vals = [int(x) for x in tokens[2:2 + n]]

    res = []
    i = 0
    while i < n:
        if i + k <= n:
            res.extend(reversed(vals[i:i + k]))
            i += k
        else:
            res.extend(vals[i:])
            break

    print(" ".join(map(str, res)))

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

    int n, k;
    if (!(cin >> n >> k)) return 0;

    vector<int> vals(n);
    for (int i = 0; i < n; ++i) cin >> vals[i];

    for (int i = 0; i + k <= n; i += k) {
        reverse(vals.begin() + i, vals.begin() + i + k);
    }

    for (int i = 0; i < n; ++i) {
        cout << vals[i] << (i + 1 == n ? "" : " ");
    }
    cout << "\\n";

    return 0;
}
`,
  },
};
