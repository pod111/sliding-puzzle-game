/**
 * 应用入口文件
 * 初始化游戏、路由和全局状态
 */

import { PuzzleEngine } from './core/puzzle/PuzzleEngine.js';
import { CanvasRenderer } from './core/canvas/CanvasRenderer.js';
import { TouchHandler } from './core/input/TouchHandler.js';
import { AStarSolver } from './core/solver/AStarSolver.js';
import { getAllChapters, getChapterLevels, getPlaceholderImage } from './config/levels.config.js';
import { generatePlaceholderImage } from './utils/svgGenerator.js';

/**
 * 游戏应用类
 */
class GameApp {
  constructor() {
    this.puzzleEngine = null;
    this.canvasRenderer = null;
    this.touchHandler = null;
    this.solver = new AStarSolver();
    this.currentPage = 'home';
    this.gameState = {
      coins: 1000,
      currentLevel: null,
      currentChapter: null,
      isPlaying: false,
      unlockedLevels: { 'animals': 0 },
      completedLevels: []
    };
    this.placeholderImages = {};
    this.gameLoopId = null;
    this._hintCache = null;
    this._hintComputing = false;
  }

  /**
   * 初始化应用
   */
  async init() {
    console.log('🎮 滑块拼图 - 初始化中...');
    
    // 预生成占位图
    this.initPlaceholderImages();
    
    // 隐藏加载屏幕
    this.hideLoadingScreen();
    
    // 初始化路由
    this.initRouter();
    
    // 初始化导航
    this.initNavigation();
    
    // 加载首页
    this.navigateTo('home');
    
    console.log('✅ 应用初始化完成');
  }

  /**
   * 初始化占位图
   */
  initPlaceholderImages() {
    const chapters = ['animals', 'nature', 'food', 'art'];
    const configs = {
      animals: [
        { text: '小猫咪', icon: '🐱', bgColor: '#FFB6C1' },
        { text: '小狗狗', icon: '🐶', bgColor: '#D2B48C' },
        { text: '小兔子', icon: '🐰', bgColor: '#F0E68C' },
        { text: '小熊猫', icon: '🐼', bgColor: '#D3D3D3' },
        { text: '小老虎', icon: '🐯', bgColor: '#FFA500' },
      ],
      nature: [
        { text: '日出', icon: '🌅', bgColor: '#FFD700' },
        { text: '森林', icon: '🌲', bgColor: '#228B22' },
        { text: '海滩', icon: '🏖️', bgColor: '#87CEEB' },
        { text: '山脉', icon: '⛰️', bgColor: '#8B4513' },
        { text: '湖泊', icon: '🏞️', bgColor: '#4682B4' },
      ],
      food: [
        { text: '寿司', icon: '🍣', bgColor: '#F4A460' },
        { text: '蛋糕', icon: '🎂', bgColor: '#FFB6C1' },
        { text: '披萨', icon: '🍕', bgColor: '#FFD700' },
        { text: '水果', icon: '🍎', bgColor: '#FF6347' },
        { text: '冰淇淋', icon: '🍦', bgColor: '#E6E6FA' },
      ],
      art: [
        { text: '星空', icon: '🌌', bgColor: '#191970' },
        { text: '向日葵', icon: '🌻', bgColor: '#FFD700' },
        { text: '蒙娜丽莎', icon: '🖼️', bgColor: '#8B7355' },
        { text: '呐喊', icon: '😱', bgColor: '#FF4500' },
        { text: '睡莲', icon: '🪷', bgColor: '#E0FFFF' },
      ]
    };

    chapters.forEach(chapter => {
      this.placeholderImages[chapter] = configs[chapter].map(config => 
        generatePlaceholderImage(config)
      );
    });
  }

  /**
   * 隐藏加载屏幕
   */
  hideLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      loadingScreen.classList.add('hidden');
      setTimeout(() => {
        loadingScreen.style.display = 'none';
      }, 300);
    }
  }

  /**
   * 初始化路由
   */
  initRouter() {
    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.slice(1) || 'home';
      this.navigateTo(hash);
    });

    const initialHash = window.location.hash.slice(1) || 'home';
    this.navigateTo(initialHash);
  }

  /**
   * 初始化导航
   */
  initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const page = item.dataset.page;
        window.location.hash = page;
      });
    });
  }

  /**
   * 导航到指定页面
   */
  navigateTo(page) {
    console.log(`📄 导航到: ${page}`);
    
    this.updateNavState(page);
    
    const mainContent = document.getElementById('main-content');
    
    // 清理当前游戏
    if (this.currentPage === 'game' && page !== 'game') {
      this.cleanupGame();
    }
    
    switch (page) {
      case 'home':
        this.renderHomePage(mainContent);
        break;
      case 'game':
        this.renderGamePage(mainContent);
        break;
      case 'levels':
        this.renderLevelsPage(mainContent);
        break;
      case 'achievements':
        this.renderAchievementsPage(mainContent);
        break;
      case 'profile':
        this.renderProfilePage(mainContent);
        break;
      default:
        if (page.startsWith('chapter/')) {
          const chapterId = page.split('/')[1];
          this.renderChapterPage(mainContent, chapterId);
        } else {
          this.renderHomePage(mainContent);
        }
    }
    
    this.currentPage = page;
  }

  /**
   * 更新导航状态
   */
  updateNavState(activePage) {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      if (item.dataset.page === activePage) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  }

  /**
   * 渲染首页
   */
  renderHomePage(container) {
    const chapters = getAllChapters();
    
    container.innerHTML = `
      <div class="home-page">
        <div class="hero-section">
          <h2 class="hero-title">滑块拼图</h2>
          <p class="hero-subtitle">挑战你的逻辑思维</p>
        </div>
        
        <div class="quick-actions">
          <button class="btn btn-primary btn-large" id="btn-continue">
            <span>▶️</span>
            <span>继续游戏</span>
          </button>
          
          <button class="btn btn-secondary" id="btn-new-game">
            <span>🎮</span>
            <span>新游戏</span>
          </button>
          
          <button class="btn btn-secondary" id="btn-daily">
            <span>📅</span>
            <span>每日挑战</span>
          </button>
        </div>
        
        <div class="chapters-preview">
          <h3 class="section-title">选择主题</h3>
          <div class="chapters-grid">
            ${chapters.map(chapter => `
              <div class="chapter-card" data-chapter="${chapter.id}">
                <div class="chapter-preview" style="background: ${chapter.color}">
                  <span class="chapter-icon">${this.getChapterIcon(chapter.id)}</span>
                </div>
                <div class="chapter-info">
                  <span class="chapter-name">${chapter.name}</span>
                  <span class="chapter-levels">${chapter.levelCount} 关</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
        
        <div class="stats-preview">
          <div class="stat-card">
            <div class="stat-value">${this.gameState.coins}</div>
            <div class="stat-label">金币</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${this.gameState.completedLevels.length}</div>
            <div class="stat-label">已通关</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">0</div>
            <div class="stat-label">成就</div>
          </div>
        </div>
      </div>
    `;

    // 绑定事件
    document.getElementById('btn-new-game')?.addEventListener('click', () => {
      window.location.hash = 'levels';
    });

    document.getElementById('btn-continue')?.addEventListener('click', () => {
      this.startGame('animals', 0);
    });

    document.querySelectorAll('.chapter-card').forEach(card => {
      card.addEventListener('click', () => {
        const chapterId = card.dataset.chapter;
        window.location.hash = `chapter/${chapterId}`;
      });
    });
  }

  /**
   * 获取章节图标
   */
  getChapterIcon(chapterId) {
    const icons = {
      animals: '🐱',
      nature: '🌲',
      food: '🍕',
      art: '🎨'
    };
    return icons[chapterId] || '🧩';
  }

  /**
   * 渲染关卡页面
   */
  renderLevelsPage(container) {
    const chapters = getAllChapters();
    
    container.innerHTML = `
      <div class="levels-page">
        <h2 class="page-title">选择主题</h2>
        <div class="chapters-list">
          ${chapters.map((chapter, index) => {
            const isUnlocked = this.isChapterUnlocked(chapter.id);
            return `
              <div class="chapter-row ${isUnlocked ? '' : 'locked'}" data-chapter="${chapter.id}">
                <div class="chapter-thumb" style="background: ${chapter.color}">
                  <span>${this.getChapterIcon(chapter.id)}</span>
                </div>
                <div class="chapter-details">
                  <h3>${chapter.name}</h3>
                  <p>${chapter.description}</p>
                  <div class="chapter-meta">
                    <span class="difficulty-badge ${chapter.difficulty}">${this.getDifficultyText(chapter.difficulty)}</span>
                    <span>${chapter.gridSize}×${chapter.gridSize}</span>
                  </div>
                </div>
                <div class="chapter-arrow">›</div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    document.querySelectorAll('.chapter-row:not(.locked)').forEach(row => {
      row.addEventListener('click', () => {
        window.location.hash = `chapter/${row.dataset.chapter}`;
      });
    });
  }

  /**
   * 渲染章节关卡页面
   */
  renderChapterPage(container, chapterId) {
    const levels = getChapterLevels(chapterId);
    const chapter = getAllChapters().find(c => c.id === chapterId);
    
    container.innerHTML = `
      <div class="chapter-page">
        <div class="chapter-header">
          <button class="btn-icon" id="btn-back">←</button>
          <h2 class="page-title">${chapter?.name || '关卡'}</h2>
        </div>
        <div class="levels-grid">
          ${levels.map((level, index) => {
            const isUnlocked = this.isLevelUnlocked(chapterId, index);
            const isCompleted = this.isLevelCompleted(level.id);
            const stars = this.getLevelStars(level.id);
            
            return `
              <div class="level-item ${isUnlocked ? '' : 'locked'} ${isCompleted ? 'completed' : ''}" 
                   data-level-index="${index}"
                   data-chapter="${chapterId}">
                <div class="level-image" style="background-image: url('${this.placeholderImages[chapterId]?.[index] || ''}')">
                  ${!isUnlocked ? '<span class="lock-icon">🔒</span>' : ''}
                  ${isCompleted ? `<div class="stars">${'⭐'.repeat(stars)}</div>` : ''}
                </div>
                <div class="level-info">
                  <span class="level-number">${index + 1}</span>
                  <span class="level-name">${level.name}</span>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    document.getElementById('btn-back')?.addEventListener('click', () => {
      window.location.hash = 'levels';
    });

    document.querySelectorAll('.level-item:not(.locked)').forEach(item => {
      item.addEventListener('click', () => {
        const chapterId = item.dataset.chapter;
        const levelIndex = parseInt(item.dataset.levelIndex);
        this.startGame(chapterId, levelIndex);
      });
    });
  }

  /**
   * 渲染游戏页面
   */
  renderGamePage(container) {
    const level = this.gameState.currentLevel;
    const levelName = level ? `${level.chapterName} - ${level.name}` : '自由模式';
    
    container.innerHTML = `
      <div class="game-page">
        <div class="game-header">
          <button class="btn-icon" id="btn-back">←</button>
          <div class="game-info">
            <span class="level-name">${levelName}</span>
            <div class="game-stats">
              <span class="stat-time">⏱️ <span id="game-time">00:00</span></span>
              <span class="stat-moves">👣 <span id="game-moves">0</span></span>
            </div>
          </div>
          <button class="btn-icon" id="btn-pause">⏸️</button>
        </div>
        
        <div class="game-board-container">
          <canvas id="game-canvas" class="game-canvas"></canvas>
        </div>
        
        <div class="game-toolbar">
          <button class="tool-btn" id="btn-hint" title="提示">
            <span>💡</span>
            <span class="tool-label">提示</span>
          </button>
          <button class="tool-btn" id="btn-undo" title="撤销">
            <span>↩️</span>
            <span class="tool-label">撤销</span>
          </button>
          <button class="tool-btn" id="btn-reset" title="重置">
            <span>🔄</span>
            <span class="tool-label">重置</span>
          </button>
        </div>
      </div>
    `;

    setTimeout(() => {
      this.initGameCanvas();
    }, 0);

    document.getElementById('btn-back')?.addEventListener('click', () => {
      this.cleanupGame();
      window.location.hash = this.gameState.currentChapter ? `chapter/${this.gameState.currentChapter}` : 'levels';
    });
  }

  /**
   * 初始化游戏Canvas
   */
  initGameCanvas() {
    const canvas = document.getElementById('game-canvas');
    if (!canvas) {
      console.error('Canvas element not found');
      return;
    }

    const container = canvas.parentElement;
    if (!container) {
      console.error('Canvas container not found');
      return;
    }

    // 确保容器有尺寸
    const containerWidth = container.clientWidth || 300;
    const containerHeight = container.clientHeight || window.innerHeight * 0.5;
    const size = Math.min(containerWidth, containerHeight, 400);
    
    // 设置Canvas样式尺寸
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    canvas.style.display = 'block';
    canvas.style.margin = '0 auto';

    console.log('Initializing canvas:', { containerWidth, containerHeight, size });

    try {
      this.canvasRenderer = new CanvasRenderer('game-canvas');
    } catch (error) {
      console.error('Failed to create CanvasRenderer:', error);
      return;
    }

    const gridSize = this.gameState.currentLevel?.gridSize || 3;
    const initialLayout = this.gameState.currentLevel?.initialLayout || null;
    this.puzzleEngine = new PuzzleEngine({ size: gridSize, initialLayout });

    this.touchHandler = new TouchHandler(canvas);

    this.bindGameEvents();

    this.puzzleEngine.init(true);

    // 延迟渲染确保Canvas已准备好
    setTimeout(() => {
      this.renderGame();
      this.startGameLoop();
      console.log('🎮 游戏已启动');
    }, 100);

    // 游戏开始时预计算提示
    this._precomputeHint();
  }

  async _precomputeHint() {
    if (!this.puzzleEngine || this.puzzleEngine.isSolved) return;

    console.log('🧮 开始预计算提示...');
    try {
      const state = this.puzzleEngine.getState();
      const result = await this.solver.solveAsync(state);

      if (result && result.moves && result.moves.length > 0) {
        const serialized = this.solver.serializeState(state.tiles);
        this._hintCache = {
          moves: result.moves,
          stepIndex: 0,
          initialState: serialized,
        };
        console.log('✅ 提示预计算完成，共', result.moves.length, '步');
      } else if (result?.reason === 'already_completed') {
        console.log('✅ 拼图已完成，无需提示');
      } else {
        console.warn('⚠️ 提示预计算失败:', result);
      }
    } catch (err) {
      console.error('提示预计算异常:', err);
    }
  }

  /**
   * 绑定游戏事件
   */
  bindGameEvents() {
    this.puzzleEngine.addEventListener('move', (e) => {
      this.updateGameUI(e.detail.state);
      this.renderGame();
    });

    this.puzzleEngine.addEventListener('solved', (e) => {
      this.onGameSolved(e.detail);
    });

    this.touchHandler.addEventListener('tap', (e) => {
      this.handleCanvasTap(e.detail);
    });

    this.touchHandler.addEventListener('swipe', (e) => {
      this.handleCanvasSwipe(e.detail);
    });

    document.getElementById('btn-undo')?.addEventListener('click', () => {
      this.puzzleEngine.undo();
    });

    document.getElementById('btn-reset')?.addEventListener('click', () => {
      this.puzzleEngine.reset();
      this.renderGame();
      this._precomputeHint();
    });

    document.getElementById('btn-hint')?.addEventListener('click', () => {
      this.showHint();
    });

    document.getElementById('btn-pause')?.addEventListener('click', () => {
      this.puzzleEngine.pause();
      if (confirm('游戏已暂停，点击确定继续')) {
        this.puzzleEngine.resume();
      }
    });
  }

  /**
   * 显示提示
   */
  async showHint() {
    if (!this.puzzleEngine || !this.puzzleEngine.isPlaying || this.puzzleEngine.isSolved) {
      alert('请先开始游戏');
      return;
    }

    if (this._hintCache && this._hintCache.moves && this._hintCache.moves.length > 0) {
      console.log('📋 提示缓存命中，显示步骤：', this._hintCache.moves.map(m => `tile${m.tileId + 1}`).join(' → '));
      this._showHintSteps(this._hintCache.moves, this.puzzleEngine.size);
      return;
    }

    if (this._hintComputing) {
      console.warn('提示正在计算中，请稍后再试');
      alert('提示正在计算中，请稍后再试');
      return;
    }

    this._hintComputing = true;
    const hintBtn = document.getElementById('btn-hint');
    const hintLabel = hintBtn?.querySelector('.tool-label');
    if (hintBtn) hintBtn.disabled = true;
    if (hintLabel) hintLabel.textContent = '计算中...';

    let state;
    try {
      state = this.puzzleEngine.getState();
    } catch (err) {
      console.error('获取游戏状态失败:', err);
      this._resetHintButton();
      alert('⚠️ 无法获取游戏状态');
      return;
    }

    let result = null;
    try {
      result = await this.solver.solveAsync(state);
    } catch (err) {
      console.error('A* 求解异常:', err);
    }

    if (!result || !result.moves || result.moves.length === 0) {
      this._resetHintButton();
      if (result?.reason === 'already_completed') {
        alert('🎉 拼图已完成！');
      } else if (result?.reason === 'timeout') {
        alert('⏰ 提示计算超时，请先手动移动几步后再试');
      } else {
        alert('⚠️ 当前拼图状态无法求解');
      }
      return;
    }

    const serialized = this.solver.serializeState(state.tiles);
    this._hintCache = {
      moves: result.moves,
      stepIndex: 0,
      initialState: serialized,
    };

    console.log('📋 提示计算完成，显示步骤：', result.moves.map(m => `tile${m.tileId + 1}`).join(' → '));
    this._showHintSteps(result.moves, state.size);
    this._resetHintButton();
  }

  _showHintSteps(moves, size) {
    const lines = moves.map((m, i) => {
      const direction = this.getMoveDirection(m, size);
      return `${i + 1}. 将第 ${m.tileId + 1} 块${direction}`;
    });

    const message = [
      '💡 提示步骤：',
      '',
      ...lines,
      '',
      `共 ${moves.length} 步，请按顺序操作`,
    ].join('\n');

    alert(message);
  }

  applyMovesToState(initialState, moves, count) {
    const state = [...initialState];
    for (let i = 0; i < count; i++) {
      const m = moves[i];
      state[m.toIndex] = state[m.fromIndex];
      state[m.fromIndex] = 0;
    }
    return state;
  }

  _resetHintButton() {
    this._hintComputing = false;
    const btn = document.getElementById('btn-hint');
    const label = btn?.querySelector('.tool-label');
    if (btn) btn.disabled = false;
    if (label) label.textContent = '提示';
  }

  /**
   * 高亮提示的拼图块
   */
  highlightTile(tileId) {
    const canvas = document.getElementById('game-canvas');
    if (!canvas) return;
    
    // 简单闪烁效果
    canvas.style.transition = 'box-shadow 0.3s';
    canvas.style.boxShadow = '0 0 20px rgba(255, 165, 0, 0.8)';
    
    setTimeout(() => {
      canvas.style.boxShadow = 'var(--shadow-md)';
    }, 1000);
  }

  /**
   * 获取移动方向描述
   */
  getMoveDirection(move, gridSize) {
    const fromRow = Math.floor(move.fromIndex / gridSize);
    const fromCol = move.fromIndex % gridSize;
    const toRow = Math.floor(move.toIndex / gridSize);
    const toCol = move.toIndex % gridSize;
    
    if (fromRow > toRow) return '向上移动';
    if (fromRow < toRow) return '向下移动';
    if (fromCol > toCol) return '向左移动';
    if (fromCol < toCol) return '向右移动';
    return '移动';
  }

  /**
   * 处理Canvas点击
   */
  handleCanvasTap(detail) {
    const { x, y } = detail;
    const tileIndex = this.getTileIndexFromPosition(x, y);
    
    if (tileIndex !== -1) {
      this.puzzleEngine.moveTile(tileIndex);
    }
  }

  /**
   * 处理Canvas滑动
   */
  handleCanvasSwipe(detail) {
    const { direction } = detail;
    const emptyIndex = this.puzzleEngine.emptyIndex;
    const size = this.puzzleEngine.size;
    
    let targetIndex = -1;
    
    switch (direction) {
      case 'up':
        targetIndex = emptyIndex + size;
        break;
      case 'down':
        targetIndex = emptyIndex - size;
        break;
      case 'left':
        targetIndex = emptyIndex + 1;
        break;
      case 'right':
        targetIndex = emptyIndex - 1;
        break;
    }
    
    if (targetIndex >= 0 && targetIndex < size * size) {
      this.puzzleEngine.moveTile(targetIndex);
    }
  }

  /**
   * 从位置获取拼图块索引
   */
  getTileIndexFromPosition(x, y) {
    const canvas = document.getElementById('game-canvas');
    const rect = canvas.getBoundingClientRect();
    const size = this.puzzleEngine.size;
    
    const tileSize = this.canvasRenderer.calculateTileSize(size);
    const gap = this.canvasRenderer.options.tileGap;
    const totalSize = size * tileSize + (size + 1) * gap;
    
    const offsetX = (rect.width - totalSize) / 2 + gap;
    const offsetY = (rect.height - totalSize) / 2 + gap;
    
    const col = Math.floor((x - offsetX) / (tileSize + gap));
    const row = Math.floor((y - offsetY) / (tileSize + gap));
    
    if (col >= 0 && col < size && row >= 0 && row < size) {
      return row * size + col;
    }
    
    return -1;
  }

  /**
   * 渲染游戏
   */
  renderGame() {
    if (!this.puzzleEngine || !this.canvasRenderer) return;
    
    const state = this.puzzleEngine.getState();
    
    // 准备图片
    const images = new Map();
    const chapterId = this.gameState.currentChapter;
    const levelIndex = this.gameState.currentLevel?._index || 0;
    
    if (chapterId && this.placeholderImages[chapterId]) {
      const imgSrc = this.placeholderImages[chapterId][levelIndex];
      if (imgSrc) {
        const img = new Image();
        img.onload = () => {
          state.tiles.forEach(tile => {
            if (!tile.isEmpty) {
              images.set(tile.id, {
                element: img,
                loaded: true,
                width: img.naturalWidth || 400,
                height: img.naturalHeight || 400
              });
            }
          });
          this.canvasRenderer.renderPuzzle(state, images);
        };
        img.onerror = () => {
          console.warn('Failed to load placeholder image, using fallback');
          this.canvasRenderer.renderPuzzle(state, images);
        };
        img.src = imgSrc;
      } else {
        this.canvasRenderer.renderPuzzle(state, images);
      }
    } else {
      this.canvasRenderer.renderPuzzle(state, images);
    }
  }

  /**
   * 启动游戏循环
   */
  startGameLoop() {
    if (this.canvasRenderer) {
      this.canvasRenderer.startAnimationLoop();
    }
    
    // 更新时间显示
    this.gameLoopId = setInterval(() => {
      if (this.puzzleEngine?.isPlaying) {
        this.updateGameUI(this.puzzleEngine.getState());
      }
    }, 1000);
  }

  /**
   * 更新游戏UI
   */
  updateGameUI(state) {
    const timeEl = document.getElementById('game-time');
    const movesEl = document.getElementById('game-moves');
    
    if (timeEl) {
      const seconds = Math.floor(state.time / 1000);
      const minutes = Math.floor(seconds / 60);
      const secs = seconds % 60;
      timeEl.textContent = `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    if (movesEl) {
      movesEl.textContent = state.moves;
    }
  }

  /**
   * 游戏完成回调
   */
  onGameSolved(state) {
    console.log('🎉 恭喜通关！', state);
    
    // 记录通关
    const levelId = this.gameState.currentLevel?.id;
    if (levelId && !this.gameState.completedLevels.includes(levelId)) {
      this.gameState.completedLevels.push(levelId);
    }
    
    // 解锁下一关
    this.unlockNextLevel();
    
    setTimeout(() => {
      const seconds = Math.floor(state.time / 1000);
      alert(`🎉 恭喜通关！\n\n⏱️ 用时: ${seconds}秒\n👣 步数: ${state.moves}\n\n获得 50 金币！`);
      
      this.gameState.coins += 50;
      this.cleanupGame();
      window.location.hash = this.gameState.currentChapter ? `chapter/${this.gameState.currentChapter}` : 'levels';
    }, 500);
  }

  /**
   * 解锁下一关
   */
  unlockNextLevel() {
    const chapterId = this.gameState.currentChapter;
    const levelIndex = this.gameState.currentLevel?._index;
    
    if (chapterId !== undefined && levelIndex !== undefined) {
      const currentUnlocked = this.gameState.unlockedLevels[chapterId] || 0;
      if (levelIndex >= currentUnlocked) {
        this.gameState.unlockedLevels[chapterId] = levelIndex + 1;
      }
    }
  }

  /**
   * 开始游戏
   */
  startGame(chapterId, levelIndex) {
    const levels = getChapterLevels(chapterId);
    const level = levels[levelIndex];
    
    if (!level) {
      console.error('关卡不存在');
      return;
    }
    
    this.gameState.currentChapter = chapterId;
    this.gameState.currentLevel = { ...level, _index: levelIndex };
    this.gameState.isPlaying = true;
    
    window.location.hash = 'game';
  }

  /**
   * 清理游戏资源
   */
  cleanupGame() {
    if (this.gameLoopId) {
      clearInterval(this.gameLoopId);
      this.gameLoopId = null;
    }
    
    if (this.canvasRenderer) {
      this.canvasRenderer.destroy();
      this.canvasRenderer = null;
    }
    
    if (this.touchHandler) {
      this.touchHandler.destroy();
      this.touchHandler = null;
    }
    
    if (this.puzzleEngine) {
      this.puzzleEngine.destroy();
      this.puzzleEngine = null;
    }
    
    this.gameState.isPlaying = false;
    this._hintCache = null;
  }

  /**
   * 检查章节是否解锁
   */
  isChapterUnlocked(chapterId) {
    const order = ['animals', 'nature', 'food', 'art'];
    const index = order.indexOf(chapterId);
    
    if (index === 0) return true;
    
    // 检查前一章节是否通关
    const prevChapter = order[index - 1];
    const prevLevels = getChapterLevels(prevChapter);
    const completedInPrev = prevLevels.filter(l => 
      this.gameState.completedLevels.includes(l.id)
    ).length;
    
    return completedInPrev >= prevLevels.length;
  }

  /**
   * 检查关卡是否解锁
   */
  isLevelUnlocked(chapterId, levelIndex) {
    const unlocked = this.gameState.unlockedLevels[chapterId] || 0;
    return levelIndex <= unlocked;
  }

  /**
   * 检查关卡是否完成
   */
  isLevelCompleted(levelId) {
    return this.gameState.completedLevels.includes(levelId);
  }

  /**
   * 获取关卡星级
   */
  getLevelStars(levelId) {
    // 简化版：通关即3星
    return this.isLevelCompleted(levelId) ? 3 : 0;
  }

  /**
   * 获取难度文本
   */
  getDifficultyText(difficulty) {
    const texts = {
      beginner: '入门',
      easy: '简单',
      medium: '中等',
      hard: '困难'
    };
    return texts[difficulty] || difficulty;
  }

  /**
   * 渲染成就页面
   */
  renderAchievementsPage(container) {
    container.innerHTML = `
      <div class="achievements-page">
        <h2 class="page-title">成就</h2>
        <div class="achievements-list">
          <div class="achievement-item">
            <div class="achievement-icon">🏆</div>
            <div class="achievement-info">
              <span class="achievement-name">初次尝试</span>
              <span class="achievement-desc">完成第1关</span>
            </div>
          </div>
          <div class="achievement-item locked">
            <div class="achievement-icon">⭐</div>
            <div class="achievement-info">
              <span class="achievement-name">完美通关</span>
              <span class="achievement-desc">3星完成任意关卡</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * 渲染个人资料页面
   */
  renderProfilePage(container) {
    container.innerHTML = `
      <div class="profile-page">
        <h2 class="page-title">我的</h2>
        <div class="profile-header">
          <div class="avatar">👤</div>
          <div class="profile-info">
            <span class="profile-name">玩家</span>
            <span class="profile-id">ID: 123456</span>
          </div>
        </div>
        <div class="profile-stats">
          <div class="stat-item">
            <span class="stat-value">${this.gameState.coins}</span>
            <span class="stat-label">金币</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">${this.gameState.completedLevels.length}</span>
            <span class="stat-label">通关</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">0</span>
            <span class="stat-label">成就</span>
          </div>
        </div>
        <div class="profile-menu">
          <button class="menu-item">
            <span>⚙️ 设置</span>
            <span>›</span>
          </button>
          <button class="menu-item">
            <span>📖 帮助</span>
            <span>›</span>
          </button>
          <button class="menu-item">
            <span>ℹ️ 关于</span>
            <span>›</span>
          </button>
        </div>
      </div>
    `;
  }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
  const app = new GameApp();
  app.init();
  window.gameApp = app;
});

export default GameApp;
