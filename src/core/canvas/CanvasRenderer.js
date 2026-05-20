/**
 * Canvas渲染引擎
 * 负责拼图的渲染、动画和视觉效果
 */

export class CanvasRenderer {
  /**
   * @param {string} canvasId - Canvas元素ID
   * @param {Object} options - 配置选项
   */
  constructor(canvasId, options = {}) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) {
      throw new Error(`Canvas element with id "${canvasId}" not found`);
    }

    this.ctx = this.canvas.getContext('2d', {
      alpha: false
    });

    // 设备像素比
    this.dpr = window.devicePixelRatio || 1;

    // 配置选项
    this.options = {
      backgroundColor: '#F8F9FA',
      tileGap: 4,
      borderRadius: 12,
      shadowColor: 'rgba(0, 0, 0, 0.15)',
      shadowBlur: 8,
      shadowOffsetY: 4,
      ...options
    };

    // 动画状态
    this.animations = new Map();
    this.isRunning = false;
    this.animationId = null;

    // 图片缓存
    this.imageCache = new Map();

    this.init();
  }

  /**
   * 初始化Canvas
   */
  init() {
    this.setupCanvas();
    this.bindEvents();
  }

  /**
   * 设置Canvas尺寸和DPR
   */
  setupCanvas() {
    // 获取父容器尺寸
    const parent = this.canvas.parentElement;
    const parentRect = parent ? parent.getBoundingClientRect() : { width: 300, height: 300 };
    
    // 设置Canvas尺寸（使用父容器尺寸或默认值）
    this.width = parentRect.width || 300;
    this.height = parentRect.height || 300;

    // 确保最小尺寸
    this.width = Math.max(this.width, 200);
    this.height = Math.max(this.height, 200);

    // 使用正方形
    const size = Math.min(this.width, this.height);
    this.width = size;
    this.height = size;

    // 高清屏适配
    this.canvas.width = Math.floor(this.width * this.dpr);
    this.canvas.height = Math.floor(this.height * this.dpr);
    
    // 重置变换矩阵
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(this.dpr, this.dpr);

    // CSS尺寸
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;

    console.log('Canvas setup:', { width: this.width, height: this.height, dpr: this.dpr });
  }

  /**
   * 绑定窗口事件
   */
  bindEvents() {
    window.addEventListener('resize', () => {
      this.setupCanvas();
    });
  }

  /**
   * 渲染拼图
   * @param {Object} puzzleState - 拼图状态
   * @param {Map} images - 图片缓存
   */
  renderPuzzle(puzzleState, images = new Map()) {
    if (!this.width || !this.height) {
      console.warn('Canvas not properly sized');
      return;
    }

    this.clear();

    const { tiles, size } = puzzleState;
    
    if (!tiles || tiles.length === 0) {
      console.warn('No tiles to render');
      return;
    }

    const tileSize = this.calculateTileSize(size);
    const gap = this.options.tileGap;

    console.log('Rendering puzzle:', { size, tileSize, gap, tileCount: tiles.length });

    tiles.forEach((tile) => {
      if (tile.isEmpty) return;

      const pos = this.getTilePosition(tile.currentIndex, size, tileSize, gap);
      this.drawTile(tile, pos, tileSize, images.get(tile.id), gap, size);
    });

    // 绘制网格线
    this.drawGrid(size, tileSize, gap);
  }

  /**
   * 计算拼图块大小
   * @param {number} gridSize - 网格大小
   * @returns {number}
   */
  calculateTileSize(gridSize) {
    const gap = this.options.tileGap;
    const availableSize = this.width - gap * (gridSize + 1);
    return Math.max(Math.floor(availableSize / gridSize), 20);
  }

  /**
   * 获取拼图块位置
   * @param {number} index - 索引
   * @param {number} gridSize - 网格大小
   * @param {number} tileSize - 拼图块大小
   * @param {number} gap - 间隙
   * @returns {Object} {x, y}
   */
  getTilePosition(index, gridSize, tileSize, gap) {
    const row = Math.floor(index / gridSize);
    const col = index % gridSize;

    // 居中计算
    const totalSize = gridSize * tileSize + (gridSize + 1) * gap;
    const offsetX = (this.width - totalSize) / 2 + gap;
    const offsetY = (this.height - totalSize) / 2 + gap;

    return {
      x: offsetX + col * (tileSize + gap),
      y: offsetY + row * (tileSize + gap)
    };
  }

  /**
   * 绘制拼图块
   * @param {Object} tile - 拼图块数据
   * @param {Object} position - 位置 {x, y}
   * @param {number} size - 大小
   * @param {Object} imageData - 图片数据
   * @param {number} gap - 间隙
   * @param {number} gridSize - 网格大小
   */
  drawTile(tile, position, size, imageData, gap, gridSize = 3) {
    const { x, y } = position;

    // 保存上下文
    this.ctx.save();

    // 绘制阴影
    this.ctx.shadowColor = this.options.shadowColor;
    this.ctx.shadowBlur = this.options.shadowBlur;
    this.ctx.shadowOffsetY = this.options.shadowOffsetY;

    // 创建圆角矩形路径
    this.createRoundedRectPath(x, y, size, size, this.options.borderRadius);
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.fill();

    // 重置阴影
    this.ctx.shadowColor = 'transparent';
    this.ctx.shadowBlur = 0;
    this.ctx.shadowOffsetY = 0;

    // 创建裁剪路径
    this.createRoundedRectPath(x, y, size, size, this.options.borderRadius);
    this.ctx.clip();

    // 绘制图片切片
    const hasImage = imageData && imageData.element && imageData.element.complete && imageData.element.naturalWidth > 0;
    
    if (hasImage) {
      const img = imageData.element;
      const sourceSize = img.naturalWidth / gridSize;
      const sourceX = tile.correctCol * sourceSize;
      const sourceY = tile.correctRow * sourceSize;

      this.ctx.drawImage(
        img,
        sourceX, sourceY, sourceSize, sourceSize,
        x, y, size, size
      );
    } else {
      // 占位符背景 - 使用渐变色
      const gradient = this.ctx.createLinearGradient(x, y, x + size, y + size);
      gradient.addColorStop(0, '#E8F4FD');
      gradient.addColorStop(1, '#D4E9F7');
      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(x, y, size, size);
    }

    // 绘制编号水印（右下角，小巧半透明）
    const fontSize = Math.floor(size * 0.15);
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    this.ctx.font = `bold ${fontSize}px "Noto Sans SC", sans-serif`;
    this.ctx.textAlign = 'right';
    this.ctx.textBaseline = 'bottom';
    this.ctx.fillText(tile.id + 1, x + size - Math.floor(size * 0.08), y + size - Math.floor(size * 0.06));

    // 绘制边框
    this.ctx.strokeStyle = '#FFFFFF';
    this.ctx.lineWidth = Math.max(2, gap / 2);
    this.ctx.stroke();

    this.ctx.restore();
  }

  /**
   * 创建圆角矩形路径
   * @param {number} x
   * @param {number} y
   * @param {number} width
   * @param {number} height
   * @param {number} radius
   */
  createRoundedRectPath(x, y, width, height, radius) {
    const r = Math.min(radius, width / 2, height / 2);
    this.ctx.beginPath();
    this.ctx.moveTo(x + r, y);
    this.ctx.lineTo(x + width - r, y);
    this.ctx.quadraticCurveTo(x + width, y, x + width, y + r);
    this.ctx.lineTo(x + width, y + height - r);
    this.ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    this.ctx.lineTo(x + r, y + height);
    this.ctx.quadraticCurveTo(x, y + height, x, y + height - r);
    this.ctx.lineTo(x, y + r);
    this.ctx.quadraticCurveTo(x, y, x + r, y);
    this.ctx.closePath();
  }

  /**
   * 绘制网格线
   * @param {number} gridSize
   * @param {number} tileSize
   * @param {number} gap
   */
  drawGrid(gridSize, tileSize, gap) {
    const totalSize = gridSize * tileSize + (gridSize + 1) * gap;
    const offsetX = (this.width - totalSize) / 2;
    const offsetY = (this.height - totalSize) / 2;

    this.ctx.save();
    this.ctx.strokeStyle = '#D0D0D0';
    this.ctx.lineWidth = 2;
    this.ctx.lineJoin = 'round';

    // 绘制外边框
    this.ctx.strokeRect(offsetX, offsetY, totalSize, totalSize);

    // 绘制内部网格线
    this.ctx.strokeStyle = '#E8E8E8';
    this.ctx.lineWidth = 1;

    for (let i = 1; i < gridSize; i++) {
      // 垂直线
      const x = offsetX + i * (tileSize + gap);
      this.ctx.beginPath();
      this.ctx.moveTo(x, offsetY);
      this.ctx.lineTo(x, offsetY + totalSize);
      this.ctx.stroke();

      // 水平线
      const y = offsetY + i * (tileSize + gap);
      this.ctx.beginPath();
      this.ctx.moveTo(offsetX, y);
      this.ctx.lineTo(offsetX + totalSize, y);
      this.ctx.stroke();
    }

    this.ctx.restore();
  }

  /**
   * 启动动画循环
   */
  startAnimationLoop() {
    if (this.isRunning) return;

    this.isRunning = true;
    const loop = () => {
      if (!this.isRunning) return;

      this.updateAnimations();
      this.animationId = requestAnimationFrame(loop);
    };
    this.animationId = requestAnimationFrame(loop);
  }

  /**
   * 停止动画循环
   */
  stopAnimationLoop() {
    this.isRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  /**
   * 更新动画
   */
  updateAnimations() {
    if (this.animations.size === 0) return;

    const now = performance.now();

    this.animations.forEach((animation, tileId) => {
      const elapsed = now - animation.startTime;
      const progress = Math.min(elapsed / animation.duration, 1);
      const eased = this.easeOutCubic(progress);

      const currentX = animation.fromX + (animation.toX - animation.fromX) * eased;
      const currentY = animation.fromY + (animation.toY - animation.fromY) * eased;

      if (progress >= 1) {
        this.animations.delete(tileId);
      }
    });
  }

  /**
   * 添加移动动画
   * @param {number} tileId
   * @param {Object} fromPos
   * @param {Object} toPos
   * @param {number} duration
   */
  animateTileMove(tileId, fromPos, toPos, duration = 200) {
    this.animations.set(tileId, {
      fromX: fromPos.x,
      fromY: fromPos.y,
      toX: toPos.x,
      toY: toPos.y,
      startTime: performance.now(),
      duration,
      easing: this.easeOutCubic
    });
  }

  /**
   * 缓动函数 - easeOutCubic
   * @param {number} t
   * @returns {number}
   */
  easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  /**
   * 清除画布
   */
  clear() {
    this.ctx.fillStyle = this.options.backgroundColor;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  /**
   * 预加载图片
   * @param {string} src
   * @returns {Promise<HTMLImageElement>}
   */
  loadImage(src) {
    if (this.imageCache.has(src)) {
      return Promise.resolve(this.imageCache.get(src));
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        this.imageCache.set(src, img);
        resolve(img);
      };

      img.onerror = reject;
      img.src = src;
    });
  }

  /**
   * 销毁渲染器
   */
  destroy() {
    this.stopAnimationLoop();
    this.animations.clear();
    this.imageCache.clear();
  }
}

export default CanvasRenderer;
