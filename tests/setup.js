/**
 * Test setup configuration
 * Sets up the testing environment with jsdom and global utilities
 */

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock requestAnimationFrame
global.requestAnimationFrame = (callback) => {
  return setTimeout(callback, 0);
};

global.cancelAnimationFrame = (id) => {
  clearTimeout(id);
};

// Mock HTMLElement methods
Object.defineProperty(HTMLElement.prototype, 'offsetParent', {
  get() {
    return this.parentNode;
  },
});

Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
  get() {
    return 100;
  },
});

Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
  get() {
    return 100;
  },
});

// Mock window.getComputedStyle
global.getComputedStyle = () => ({
  getPropertyValue: () => '',
});

// Mock touch events
global.TouchEvent = class TouchEvent extends Event {
  constructor(type, options = {}) {
    super(type, options);
    this.touches = options.touches || [];
    this.changedTouches = options.changedTouches || [];
  }
};

// Mock touch
global.Touch = class Touch {
  constructor(options = {}) {
    this.identifier = options.identifier || 0;
    this.target = options.target || null;
    this.clientX = options.clientX || 0;
    this.clientY = options.clientY || 0;
  }
};

// Custom matchers
expect.extend({
  toBeVisible(element) {
    const pass = element.style.display !== 'none' && !element.hidden;
    return {
      message: () => `expected element ${pass ? 'not ' : ''}to be visible`,
      pass,
    };
  },
  toHaveAttribute(element, attribute, value) {
    const hasAttribute = element.hasAttribute(attribute);
    const actualValue = element.getAttribute(attribute);
    const pass = hasAttribute && (value === undefined || actualValue === value);
    return {
      message: () => `expected element ${pass ? 'not ' : ''}to have attribute ${attribute}${value ? ` with value ${value}` : ''}`,
      pass,
    };
  },
});

// Helper function to create DOM elements
global.createTestElement = (tag = 'div', attributes = {}, children = []) => {
  const element = document.createElement(tag);
  Object.entries(attributes).forEach(([key, value]) => {
    if (key === 'className') {
      element.className = value;
    } else if (key === 'innerHTML') {
      element.innerHTML = value;
    } else {
      element.setAttribute(key, value);
    }
  });
  children.forEach(child => {
    if (typeof child === 'string') {
      element.appendChild(document.createTextNode(child));
    } else {
      element.appendChild(child);
    }
  });
  return element;
};

// Helper function to trigger events
global.triggerEvent = (element, eventType, options = {}) => {
  const event = new Event(eventType, { bubbles: true, cancelable: true, ...options });
  Object.assign(event, options);
  element.dispatchEvent(event);
  return event;
};

// Helper function to trigger keyboard events
global.triggerKeyEvent = (element, eventType, key, options = {}) => {
  const event = new KeyboardEvent(eventType, { key, bubbles: true, cancelable: true, ...options });
  element.dispatchEvent(event);
  return event;
};

// Helper function to trigger touch events
global.triggerTouchEvent = (element, eventType, touches = []) => {
  const event = new TouchEvent(eventType, { 
    touches: touches.map(t => new Touch(t)),
    changedTouches: touches.map(t => new Touch(t)),
    bubbles: true, 
    cancelable: true 
  });
  element.dispatchEvent(event);
  return event;
};

// Wait for next tick
global.nextTick = () => new Promise(resolve => setTimeout(resolve, 0));