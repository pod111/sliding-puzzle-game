/**
 * 触摸/鼠标/键盘输入处理器
 * 统一处理各种输入事件
 */

export class TouchHandler extends EventTarget {
  /**
   * @param {HTMLElement} element - 目标元素
   * @param {Object} options - 配置选项
   */
  constructor(element, options = {}) {
    super();
    this.element = element;
    this.options = {
      threshold: 10,
      longPressDelay: 500,
      doubleTapDelay: 300,
      ...options
    };

    this.touchStartPos = null;
    this.touchStartTime = null;
    this.isDragging = false;
    this.longPressTimer = null;
    this.lastTapTime = 0;

    this.init();
  }

  /**
   * 初始化事件监听
   */
  init() {
    // 触摸事件
    this.element.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
    this.element.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
    this.element.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
    this.element.addEventListener('touchcancel', this.handleTouchCancel.bind(this), { passive: false });

    // 鼠标事件
    this.element.addEventListener('mousedown', this.handleMouseDown.bind(this));
    document.addEventListener('mousemove', this.handleMouseMove.bind(this));
    document.addEventListener('mouseup', this.handleMouseUp.bind(this));

    // 键盘事件
    document.addEventListener('keydown', this.handleKeyDown.bind(this));

    // 防止默认行为
    this.element.addEventListener('contextmenu', e => e.preventDefault());
  }

  handleTouchStart(e) {
    e.preventDefault();
    const touch = e.touches[0];
    this.startTouch(touch.clientX, touch.clientY);
  }

  handleTouchMove(e) {
    e.preventDefault();
    if (!this.touchStartPos) return;

    const touch = e.touches[0];
    this.moveTouch(touch.clientX, touch.clientY);
  }

  handleTouchEnd(e) {
    e.preventDefault();
    this.endTouch();
  }

  handleTouchCancel(e) {
    e.preventDefault();
    this.cancelTouch();
  }

  handleMouseDown(e) {
    if (e.button !== 0) return;
    this.startTouch(e.clientX, e.clientY);
  }

  handleMouseMove(e) {
    if (!this.touchStartPos) return;
    this.moveTouch(e.clientX, e.clientY);
  }

  handleMouseUp(e) {
    if (e.button !== 0) return;
    this.endTouch();
  }

  handleKeyDown(e) {
    const keyMap = {
      'ArrowUp': 'up',
      'ArrowDown': 'down',
      'ArrowLeft': 'left',
      'ArrowRight': 'right',
      'w': 'up',
      's': 'down',
      'a': 'left',
      'd': 'right',
      'W': 'up',
      'S': 'down',
      'A': 'left',
      'D': 'right'
    };

    if (keyMap[e.key]) {
      e.preventDefault();
      this.dispatchEvent(new CustomEvent('swipe', {
        detail: { direction: keyMap[e.key] }
      }));
    }

    // 撤销
    if (e.key === 'z' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      this.dispatchEvent(new CustomEvent('undo'));
    }
  }

  startTouch(clientX, clientY) {
    const rect = this.element.getBoundingClientRect();
    this.touchStartPos = {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
    this.touchStartTime = Date.now();
    this.isDragging = false;

    // 长按检测
    this.longPressTimer = setTimeout(() => {
      this.dispatchEvent(new CustomEvent('longpress', {
        detail: { x: this.touchStartPos.x, y: this.touchStartPos.y }
      }));
    }, this.options.longPressDelay);

    this.dispatchEvent(new CustomEvent('touchstart', {
      detail: { x: this.touchStartPos.x, y: this.touchStartPos.y }
    }));
  }

  moveTouch(clientX, clientY) {
    const rect = this.element.getBoundingClientRect();
    const currentPos = {
      x: clientX - rect.left,
      y: clientY - rect.top
    };

    const deltaX = currentPos.x - this.touchStartPos.x;
    const deltaY = currentPos.y - this.touchStartPos.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    if (distance > this.options.threshold) {
      this.isDragging = true;
      clearTimeout(this.longPressTimer);

      this.dispatchEvent(new CustomEvent('drag', {
        detail: {
          startX: this.touchStartPos.x,
          startY: this.touchStartPos.y,
          currentX: currentPos.x,
          currentY: currentPos.y,
          deltaX,
          deltaY
        }
      }));
    }
  }

  endTouch() {
    if (!this.touchStartPos) return;

    clearTimeout(this.longPressTimer);

    const duration = Date.now() - this.touchStartTime;

    if (!this.isDragging) {
      // 检测双击
      const now = Date.now();
      if (now - this.lastTapTime < this.options.doubleTapDelay) {
        this.dispatchEvent(new CustomEvent('doubletap', {
          detail: {
            x: this.touchStartPos.x,
            y: this.touchStartPos.y,
            duration
          }
        }));
      } else {
        // 单击
        this.dispatchEvent(new CustomEvent('tap', {
          detail: {
            x: this.touchStartPos.x,
            y: this.touchStartPos.y,
            duration
          }
        }));
      }
      this.lastTapTime = now;
    } else {
      // 滑动结束，计算方向
      const rect = this.element.getBoundingClientRect();
      const currentPos = {
        x: this.touchStartPos.x,
        y: this.touchStartPos.y
      };

      this.dispatchEvent(new CustomEvent('swipeend', {
        detail: {
          x: currentPos.x,
          y: currentPos.y,
          direction: this.getSwipeDirection(
            currentPos.x - this.touchStartPos.x,
            currentPos.y - this.touchStartPos.y
          )
        }
      }));
    }

    this.touchStartPos = null;
    this.touchStartTime = null;
    this.isDragging = false;
  }

  cancelTouch() {
    clearTimeout(this.longPressTimer);
    this.touchStartPos = null;
    this.touchStartTime = null;
    this.isDragging = false;
  }

  getSwipeDirection(deltaX, deltaY) {
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    if (absX > absY) {
      return deltaX > 0 ? 'right' : 'left';
    } else {
      return deltaY > 0 ? 'down' : 'up';
    }
  }

  destroy() {
    // 移除事件监听
    this.element.removeEventListener('touchstart', this.handleTouchStart);
    this.element.removeEventListener('touchmove', this.handleTouchMove);
    this.element.removeEventListener('touchend', this.handleTouchEnd);
    this.element.removeEventListener('touchcancel', this.handleTouchCancel);
    this.element.removeEventListener('mousedown', this.handleMouseDown);
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.handleMouseUp);
    document.removeEventListener('keydown', this.handleKeyDown);

    clearTimeout(this.longPressTimer);
  }
}

export default TouchHandler;
