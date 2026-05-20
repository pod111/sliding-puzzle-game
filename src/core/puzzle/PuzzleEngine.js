/**
 * 拼图引擎核心类
 * 负责管理拼图状态、移动逻辑、打乱算法等
 */

export class PuzzleEngine extends EventTarget {
  /**
   * @param {Object} config - 配置对象
   * @param {number} config.size - 拼图大小（3-6）
   * @param {Object} config.image - 图片对象
   * @param {number[]} config.initialLayout - 固定初始布局（可选）
   */
  constructor(config) {
    super();
    this.size = config.size || 3;
    this.image = config.image || null;
    this.initialLayout = config.initialLayout || null;
    this.tiles = [];
    this.emptyIndex = -1;
    this.moveHistory = [];
    this.moveCount = 0;
    this.startTime = null;
    this.isSolved = false;
    this.isPlaying = false;
  }

  /**
   * 初始化拼图
   * @param {boolean} useFixedLayout - 是否使用固定布局
   */
  init(useFixedLayout = true) {
    this.createTiles();
    if (useFixedLayout && this.initialLayout) {
      this.applyLayout(this.initialLayout);
    } else {
      this.shuffle();
    }
    this.startTime = Date.now();
    this.isPlaying = true;
    this.isSolved = false;
    
    this.dispatchEvent(new CustomEvent('init', { 
      detail: this.getState() 
    }));
  }

  /**
   * 创建拼图块
   */
  createTiles() {
    this.tiles = [];
    const totalTiles = this.size * this.size;
    
    for (let i = 0; i < totalTiles; i++) {
      const row = Math.floor(i / this.size);
      const col = i % this.size;
      
      this.tiles.push({
        id: i,
        currentIndex: i,
        correctIndex: i,
        correctRow: row,
        correctCol: col,
        isEmpty: i === totalTiles - 1
      });
    }
    
    this.emptyIndex = totalTiles - 1;
  }

  /**
   * 应用固定布局
   * @param {number[]} layout - 布局数组，值=拼图块ID，-1=空白
   */
  applyLayout(layout) {
    if (!layout || layout.length !== this.size * this.size) {
      console.warn('布局无效，使用默认完成状态');
      return;
    }

    for (let position = 0; position < layout.length; position++) {
      const tileId = layout[position];
      if (tileId === -1) {
        this.emptyIndex = position;
        const emptyTile = this.tiles.find(t => t.id === this.size * this.size - 1);
        if (emptyTile) {
          emptyTile.currentIndex = position;
        }
      } else {
        const tile = this.tiles.find(t => t.id === tileId);
        if (tile) {
          tile.currentIndex = position;
        }
      }
    }

    this.moveCount = 0;
    this.moveHistory = [];
  }

  /**
   * 可解打乱算法
   * 从完成状态开始，随机执行有效移动，保证拼图可解
   */
  shuffle() {
    const shuffleMoves = this.size * 25;
    let lastMove = -1;
    
    for (let i = 0; i < shuffleMoves; i++) {
      const validMoves = this.getValidMoves();
      const filteredMoves = validMoves.filter(m => m !== lastMove);
      const randomMove = filteredMoves[Math.floor(Math.random() * filteredMoves.length)];
      
      this.executeMove(randomMove, false);
      lastMove = this.emptyIndex;
    }
    
    this.moveCount = 0;
    this.moveHistory = [];
  }

  /**
   * 获取可移动的拼图块索引
   * @returns {number[]} 可移动的索引数组
   */
  getValidMoves() {
    const moves = [];
    const row = Math.floor(this.emptyIndex / this.size);
    const col = this.emptyIndex % this.size;
    
    if (row > 0) moves.push(this.emptyIndex - this.size);
    if (row < this.size - 1) moves.push(this.emptyIndex + this.size);
    if (col > 0) moves.push(this.emptyIndex - 1);
    if (col < this.size - 1) moves.push(this.emptyIndex + 1);
    
    return moves;
  }

  /**
   * 尝试移动拼图块
   * @param {number} index - 要移动的拼图块索引
   * @returns {Object} 移动结果
   */
  moveTile(index) {
    if (!this.isPlaying || this.isSolved) {
      return { success: false, reason: 'game_not_active' };
    }

    if (!this.canMove(index)) {
      return { success: false, reason: 'invalid_move' };
    }
    
    const move = this.executeMove(index, true);
    const wasSolved = this.checkSolved();
    
    this.dispatchEvent(new CustomEvent('move', { 
      detail: { move, state: this.getState() } 
    }));
    
    if (wasSolved) {
      this.isSolved = true;
      this.isPlaying = false;
      this.dispatchEvent(new CustomEvent('solved', { 
        detail: this.getState() 
      }));
    }
    
    return {
      success: true,
      move,
      isSolved: this.isSolved,
      state: this.getState()
    };
  }

  /**
   * 检查是否可以移动指定索引的拼图块
   * @param {number} index - 拼图块索引
   * @returns {boolean}
   */
  canMove(index) {
    const row = Math.floor(index / this.size);
    const col = index % this.size;
    const emptyRow = Math.floor(this.emptyIndex / this.size);
    const emptyCol = this.emptyIndex % this.size;
    
    const rowDiff = Math.abs(row - emptyRow);
    const colDiff = Math.abs(col - emptyCol);
    
    return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
  }

  /**
   * 执行移动
   * @param {number} index - 要移动的拼图块索引
   * @param {boolean} record - 是否记录到历史
   * @returns {Object} 移动信息
   */
  executeMove(index, record = true) {
    const tile = this.tiles.find(t => t.currentIndex === index);
    const move = {
      tileId: tile.id,
      fromIndex: index,
      toIndex: this.emptyIndex,
      timestamp: Date.now()
    };
    
    tile.currentIndex = this.emptyIndex;
    this.emptyIndex = index;
    
    if (record) {
      this.moveHistory.push(move);
      this.moveCount++;
    }
    
    return move;
  }

  /**
   * 撤销上一步移动
   * @returns {Object|null} 撤销结果
   */
  undo() {
    if (this.moveHistory.length === 0 || this.isSolved) {
      return null;
    }
    
    const lastMove = this.moveHistory.pop();
    const tile = this.tiles.find(t => t.id === lastMove.tileId);
    
    tile.currentIndex = lastMove.fromIndex;
    this.emptyIndex = lastMove.toIndex;
    
    this.moveCount--;
    
    this.dispatchEvent(new CustomEvent('undo', { 
      detail: { move: lastMove, state: this.getState() } 
    }));
    
    return {
      success: true,
      move: lastMove,
      state: this.getState()
    };
  }

  /**
   * 检查拼图是否完成
   * @returns {boolean}
   */
  checkSolved() {
    return this.tiles.every(tile => 
      tile.isEmpty || tile.currentIndex === tile.correctIndex
    );
  }

  /**
   * 暂停游戏
   */
  pause() {
    if (this.isPlaying) {
      this.isPlaying = false;
      this.dispatchEvent(new CustomEvent('pause', { 
        detail: this.getState() 
      }));
    }
  }

  /**
   * 恢复游戏
   */
  resume() {
    if (!this.isSolved) {
      this.isPlaying = true;
      this.dispatchEvent(new CustomEvent('resume', { 
        detail: this.getState() 
      }));
    }
  }

  /**
   * 重置当前关卡 - 恢复到固定初始布局
   */
  reset() {
    this.init(true);
  }

  /**
   * 获取当前状态
   * @returns {Object}
   */
  getState() {
    return {
      tiles: this.tiles.map(t => ({ ...t })),
      emptyIndex: this.emptyIndex,
      moves: this.moveCount,
      time: this.startTime ? Date.now() - this.startTime : 0,
      isSolved: this.isSolved,
      isPlaying: this.isPlaying,
      size: this.size
    };
  }

  /**
   * 从状态恢复
   * @param {Object} state - 状态对象
   */
  restoreState(state) {
    this.size = state.size;
    this.tiles = state.tiles.map(t => ({ ...t }));
    this.emptyIndex = state.emptyIndex;
    this.moveCount = state.moves;
    this.startTime = Date.now() - state.time;
    this.isSolved = state.isSolved;
    this.isPlaying = state.isPlaying;
  }

  /**
   * 获取指定索引位置的拼图块
   * @param {number} index - 位置索引
   * @returns {Object|null}
   */
  getTileAt(index) {
    return this.tiles.find(t => t.currentIndex === index) || null;
  }

  /**
   * 获取拼图块当前位置
   * @param {number} tileId - 拼图块ID
   * @returns {Object} {row, col}
   */
  getTilePosition(tileId) {
    const tile = this.tiles.find(t => t.id === tileId);
    if (!tile) return null;
    
    return {
      row: Math.floor(tile.currentIndex / this.size),
      col: tile.currentIndex % this.size
    };
  }

  /**
   * 销毁引擎
   */
  destroy() {
    this.isPlaying = false;
    this.tiles = [];
    this.moveHistory = [];
  }
}

export default PuzzleEngine;