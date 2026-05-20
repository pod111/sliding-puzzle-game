/**
 * A* 解谜算法
 * 用于计算拼图的最优解和提示
 */

export class AStarSolver {
  /**
   * @param {Object} config - 配置对象
   * @param {number} config.maxIterations - 最大迭代次数
   * @param {number} config.timeLimit - 时间限制（毫秒）
   */
  constructor(config = {}) {
    this.maxIterations = config.maxIterations || 100000;
    this.timeLimit = config.timeLimit || 5000;
  }

  /**
   * 异步求解拼图（不阻塞主线程）
   * @param {Object} state - 拼图状态
   * @returns {Promise<Object|null>} 解决方案
   */
  async solveAsync(state) {
    const startTime = performance.now();
    const size = state.size;
    const initialState = this.serializeState(state.tiles);
    const BATCH_SIZE = 3000;
    const goalState = this.generateGoalState(size);

    if (this.stateToString(initialState) === this.stateToString(goalState)) {
      return {
        moves: [],
        steps: 0,
        time: performance.now() - startTime,
        reason: 'already_completed'
      };
    }

    const openSet = new PriorityQueue((a, b) => a.f - b.f);
    const gScore = new Map();
    const closedSet = new Set();

    const startNode = {
      state: initialState,
      g: 0,
      h: this.manhattanDistance(initialState, size),
      parent: null,
      move: null
    };
    startNode.f = startNode.g + startNode.h;

    openSet.enqueue(startNode);
    gScore.set(this.stateToString(initialState), 0);

    let iterations = 0;

    while (!openSet.isEmpty() && iterations < this.maxIterations) {

      for (let batch = 0; batch < BATCH_SIZE && !openSet.isEmpty() && iterations < this.maxIterations; batch++) {
        const current = openSet.dequeue();

        if (current.h === 0) {
          const result = {
            moves: this.reconstructPath(current),
            steps: current.g,
            time: performance.now() - startTime,
            iterations
          };
          return result;
        }

        const currentKey = this.stateToString(current.state);
        closedSet.add(currentKey);

        const neighbors = this.getNeighbors(current, size);

        for (const neighbor of neighbors) {
          const stateKey = this.stateToString(neighbor.state);

          if (closedSet.has(stateKey)) continue;

          const newG = current.g + 1;
          if (gScore.has(stateKey) && gScore.get(stateKey) <= newG) continue;

          gScore.set(stateKey, newG);
          neighbor.g = newG;
          neighbor.h = this.manhattanDistance(neighbor.state, size);
          neighbor.f = neighbor.g + neighbor.h;

          openSet.enqueue(neighbor);
        }

        iterations++;
      }

      if (performance.now() - startTime > this.timeLimit) {
        console.warn('A* 求解超时:', { iterations, elapsed: performance.now() - startTime });
        return { reason: 'timeout', iterations };
      }

      await new Promise(resolve => setTimeout(resolve, 0));
    }

    console.warn('A* 求解失败:', { iterations, maxIterations: this.maxIterations });
    return null;
  }

  /**
   * 同步求解拼图（仅在简单情况下使用）
   * @param {Object} state - 拼图状态
   * @returns {Object|null} 解决方案
   */
  solve(state) {
    const startTime = performance.now();
    const size = state.size;
    const initialState = this.serializeState(state.tiles);

    const goalState = this.generateGoalState(size);
    if (this.stateToString(initialState) === this.stateToString(goalState)) {
      return {
        moves: [],
        steps: 0,
        time: performance.now() - startTime,
        reason: 'already_completed'
      };
    }

    const openSet = new PriorityQueue((a, b) => a.f - b.f);
    const gScore = new Map();
    const closedSet = new Set();

    const startNode = {
      state: initialState,
      g: 0,
      h: this.manhattanDistance(initialState, size),
      parent: null,
      move: null
    };
    startNode.f = startNode.g + startNode.h;

    openSet.enqueue(startNode);
    gScore.set(this.stateToString(initialState), 0);

    let iterations = 0;

    while (!openSet.isEmpty() && iterations < this.maxIterations) {
      const current = openSet.dequeue();

      if (current.h === 0) {
        const result = {
          moves: this.reconstructPath(current),
          steps: current.g,
          time: performance.now() - startTime,
          iterations
        };
        return result;
      }

      const currentKey = this.stateToString(current.state);
      closedSet.add(currentKey);

      const neighbors = this.getNeighbors(current, size);

      for (const neighbor of neighbors) {
        const stateKey = this.stateToString(neighbor.state);

        if (closedSet.has(stateKey)) continue;

        const newG = current.g + 1;
        if (gScore.has(stateKey) && gScore.get(stateKey) <= newG) continue;

        gScore.set(stateKey, newG);
        neighbor.g = newG;
        neighbor.h = this.manhattanDistance(neighbor.state, size);
        neighbor.f = neighbor.g + neighbor.h;

        openSet.enqueue(neighbor);
      }

      iterations++;

      if (performance.now() - startTime > this.timeLimit) {
        return { reason: 'timeout', iterations };
      }
    }

    return null;
  }

  /**
   * 曼哈顿距离启发函数
   * @param {number[]} state - 状态数组
   * @param {number} size - 网格大小
   * @returns {number}
   */
  manhattanDistance(state, size) {
    let distance = 0;

    for (let i = 0; i < state.length; i++) {
      if (state[i] === 0) continue;

      const currentRow = Math.floor(i / size);
      const currentCol = i % size;
      const targetRow = Math.floor((state[i] - 1) / size);
      const targetCol = (state[i] - 1) % size;

      distance += Math.abs(currentRow - targetRow) + Math.abs(currentCol - targetCol);
    }

    return distance;
  }

  /**
   * 检查拼图是否可解
   * @param {number[]} state - 状态数组
   * @param {number} size - 网格大小
   * @returns {boolean}
   */
  isSolvable(state, size) {
    let inversions = 0;
    const arr = state.filter(n => n !== 0);

    for (let i = 0; i < arr.length - 1; i++) {
      for (let j = i + 1; j < arr.length; j++) {
        if (arr[i] > arr[j]) {
          inversions++;
        }
      }
    }

    if (size % 2 === 1) {
      // 奇数尺寸：逆序数为偶数则可解
      return inversions % 2 === 0;
    } else {
      // 偶数尺寸：(逆序数 + 空白行从底部数) 为奇数则可解
      const emptyRowFromTop = Math.floor(state.indexOf(0) / size);
      const emptyRowFromBottom = size - emptyRowFromTop;
      return (inversions + emptyRowFromBottom) % 2 === 1;
    }
  }

  /**
   * 生成目标状态
   * @param {number} size - 网格大小
   * @returns {number[]}
   */
  generateGoalState(size) {
    const total = size * size;
    const state = [];
    for (let i = 1; i < total; i++) {
      state.push(i);
    }
    state.push(0);
    return state;
  }

  /**
   * 序列化状态
   * @param {Object[]} tiles - 拼图块数组
   * @returns {number[]}
   */
  serializeState(tiles) {
    const state = new Array(tiles.length);

    tiles.forEach(tile => {
      state[tile.currentIndex] = tile.isEmpty ? 0 : tile.id + 1;
    });

    return state;
  }

  /**
   * 状态转字符串
   * @param {number[]} state - 状态数组
   * @returns {string}
   */
  stateToString(state) {
    return state.join(',');
  }

  /**
   * 获取邻居节点
   * @param {Object} node - 当前节点
   * @param {number} size - 网格大小
   * @returns {Object[]}
   */
  getNeighbors(node, size) {
    const neighbors = [];
    const state = node.state;
    const emptyIndex = state.indexOf(0);
    const emptyRow = Math.floor(emptyIndex / size);
    const emptyCol = emptyIndex % size;

    const directions = [
      { dr: -1, dc: 0 },
      { dr: 1, dc: 0 },
      { dr: 0, dc: -1 },
      { dr: 0, dc: 1 }
    ];

    for (const { dr, dc } of directions) {
      const newRow = emptyRow + dr;
      const newCol = emptyCol + dc;

      if (newRow >= 0 && newRow < size && newCol >= 0 && newCol < size) {
        const newIndex = newRow * size + newCol;
        const newState = [...state];

        [newState[emptyIndex], newState[newIndex]] = [newState[newIndex], newState[emptyIndex]];

        neighbors.push({
          state: newState,
          parent: node,
          move: {
            fromIndex: newIndex,
            toIndex: emptyIndex,
            tileId: state[newIndex] - 1
          }
        });
      }
    }

    return neighbors;
  }

  /**
   * 重建路径
   * @param {Object} node - 目标节点
   * @returns {Object[]}
   */
  reconstructPath(node) {
    const moves = [];
    let current = node;

    while (current.parent) {
      if (current.move) {
        moves.unshift(current.move);
      }
      current = current.parent;
    }

    return moves;
  }
}

/**
 * 优先队列实现
 */
class PriorityQueue {
  constructor(compareFn) {
    this.items = [];
    this.compare = compareFn || ((a, b) => a - b);
  }

  enqueue(item) {
    this.items.push(item);
    this.bubbleUp(this.items.length - 1);
  }

  dequeue() {
    if (this.isEmpty()) return null;

    const min = this.items[0];
    const end = this.items.pop();

    if (this.items.length > 0) {
      this.items[0] = end;
      this.sinkDown(0);
    }

    return min;
  }

  isEmpty() {
    return this.items.length === 0;
  }

  size() {
    return this.items.length;
  }

  bubbleUp(index) {
    const item = this.items[index];

    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      const parent = this.items[parentIndex];

      if (this.compare(item, parent) >= 0) break;

      this.items[parentIndex] = item;
      this.items[index] = parent;
      index = parentIndex;
    }
  }

  sinkDown(index) {
    const length = this.items.length;
    const item = this.items[index];

    while (true) {
      const leftChildIndex = 2 * index + 1;
      const rightChildIndex = 2 * index + 2;
      let swapIndex = null;

      if (leftChildIndex < length) {
        if (this.compare(this.items[leftChildIndex], item) < 0) {
          swapIndex = leftChildIndex;
        }
      }

      if (rightChildIndex < length) {
        const rightChild = this.items[rightChildIndex];
        const compareItem = swapIndex === null ? item : this.items[leftChildIndex];
        if (this.compare(rightChild, compareItem) < 0) {
          swapIndex = rightChildIndex;
        }
      }

      if (swapIndex === null) break;

      this.items[index] = this.items[swapIndex];
      this.items[swapIndex] = item;
      index = swapIndex;
    }
  }
}

export default AStarSolver;