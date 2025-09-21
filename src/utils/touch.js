/**
 * Touch and gesture utilities for mobile interactions
 */

/**
 * Touch gesture handler for swipe detection
 */
export class TouchHandler {
  constructor(element, options = {}) {
    this.element = element;
    this.options = {
      threshold: 50, // Minimum distance for swipe
      restraint: 100, // Maximum distance perpendicular to swipe direction
      allowedTime: 300, // Maximum time for swipe
      ...options
    };
    
    this.startX = 0;
    this.startY = 0;
    this.startTime = 0;
    this.isDown = false;
    
    this.handleTouchStart = this.handleTouchStart.bind(this);
    this.handleTouchMove = this.handleTouchMove.bind(this);
    this.handleTouchEnd = this.handleTouchEnd.bind(this);
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    
    this.callbacks = {
      swipeLeft: [],
      swipeRight: [],
      swipeUp: [],
      swipeDown: [],
      tap: []
    };
  }

  /**
   * Initialize touch handlers
   */
  init() {
    // Touch events
    this.element.addEventListener('touchstart', this.handleTouchStart, { passive: false });
    this.element.addEventListener('touchmove', this.handleTouchMove, { passive: false });
    this.element.addEventListener('touchend', this.handleTouchEnd, { passive: false });
    
    // Mouse events for desktop
    this.element.addEventListener('mousedown', this.handleMouseDown);
    this.element.addEventListener('mousemove', this.handleMouseMove);
    this.element.addEventListener('mouseup', this.handleMouseUp);
    this.element.addEventListener('mouseleave', this.handleMouseUp);
  }

  /**
   * Remove touch handlers
   */
  destroy() {
    this.element.removeEventListener('touchstart', this.handleTouchStart);
    this.element.removeEventListener('touchmove', this.handleTouchMove);
    this.element.removeEventListener('touchend', this.handleTouchEnd);
    this.element.removeEventListener('mousedown', this.handleMouseDown);
    this.element.removeEventListener('mousemove', this.handleMouseMove);
    this.element.removeEventListener('mouseup', this.handleMouseUp);
    this.element.removeEventListener('mouseleave', this.handleMouseUp);
  }

  /**
   * Add event listener for gestures
   */
  on(event, callback) {
    if (this.callbacks[event]) {
      this.callbacks[event].push(callback);
    }
  }

  /**
   * Remove event listener
   */
  off(event, callback) {
    if (this.callbacks[event]) {
      const index = this.callbacks[event].indexOf(callback);
      if (index > -1) {
        this.callbacks[event].splice(index, 1);
      }
    }
  }

  /**
   * Emit event to callbacks
   */
  emit(event, data = {}) {
    if (this.callbacks[event]) {
      this.callbacks[event].forEach(callback => callback(data));
    }
  }

  /**
   * Handle touch start
   */
  handleTouchStart(event) {
    const touch = event.touches[0];
    this.startGesture(touch.clientX, touch.clientY);
  }

  /**
   * Handle mouse down
   */
  handleMouseDown(event) {
    this.startGesture(event.clientX, event.clientY);
  }

  /**
   * Start gesture tracking
   */
  startGesture(x, y) {
    this.startX = x;
    this.startY = y;
    this.startTime = Date.now();
    this.isDown = true;
  }

  /**
   * Handle touch move
   */
  handleTouchMove(event) {
    if (!this.isDown) return;
    // Prevent scrolling on touch move
    event.preventDefault();
  }

  /**
   * Handle mouse move
   */
  handleMouseMove(event) {
    if (!this.isDown) return;
    event.preventDefault();
  }

  /**
   * Handle touch end
   */
  handleTouchEnd(event) {
    if (!this.isDown) return;
    const touch = event.changedTouches[0];
    this.endGesture(touch.clientX, touch.clientY);
  }

  /**
   * Handle mouse up
   */
  handleMouseUp(event) {
    if (!this.isDown) return;
    this.endGesture(event.clientX, event.clientY);
  }

  /**
   * End gesture and detect swipe
   */
  endGesture(endX, endY) {
    this.isDown = false;
    
    const elapsedTime = Date.now() - this.startTime;
    const distX = endX - this.startX;
    const distY = endY - this.startY;
    
    // Check if it's a tap (small movement, quick time)
    if (Math.abs(distX) < 10 && Math.abs(distY) < 10 && elapsedTime < 200) {
      this.emit('tap', { x: endX, y: endY });
      return;
    }
    
    // Check if it qualifies as a swipe
    if (elapsedTime <= this.options.allowedTime) {
      if (Math.abs(distX) >= this.options.threshold && Math.abs(distY) <= this.options.restraint) {
        // Horizontal swipe
        if (distX > 0) {
          this.emit('swipeRight', { distance: distX, time: elapsedTime });
        } else {
          this.emit('swipeLeft', { distance: Math.abs(distX), time: elapsedTime });
        }
      } else if (Math.abs(distY) >= this.options.threshold && Math.abs(distX) <= this.options.restraint) {
        // Vertical swipe
        if (distY > 0) {
          this.emit('swipeDown', { distance: distY, time: elapsedTime });
        } else {
          this.emit('swipeUp', { distance: Math.abs(distY), time: elapsedTime });
        }
      }
    }
  }
}

/**
 * Detect if device supports touch
 */
export function isTouchDevice() {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}