/**
 * Accessibility utilities for UI components
 */

/**
 * Manages focus trapping within an element
 */
export class FocusTrap {
  constructor(element) {
    this.element = element;
    this.focusableElements = [];
    this.firstFocusableElement = null;
    this.lastFocusableElement = null;
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  /**
   * Get all focusable elements within the trapped element
   */
  getFocusableElements() {
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input:not([disabled]):not([type="hidden"])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ].join(', ');

    this.focusableElements = Array.from(this.element.querySelectorAll(focusableSelectors))
      .filter(el => {
        // Check if element is disabled
        if (el.hasAttribute('disabled')) return false;
        
        // Check if element is visible (check both inline style and computed style)
        if (el.style.display === 'none' || el.style.visibility === 'hidden') return false;
        
        const style = window.getComputedStyle(el);
        if (style.display === 'none' || style.visibility === 'hidden') return false;
        
        // Check if element has dimensions (offsetParent is null for display:none)
        if (el.offsetParent === null && style.position !== 'fixed') return false;
        
        return true;
      });
    
    this.firstFocusableElement = this.focusableElements[0];
    this.lastFocusableElement = this.focusableElements[this.focusableElements.length - 1];
  }

  /**
   * Activate focus trap
   */
  activate() {
    this.getFocusableElements();
    document.addEventListener('keydown', this.handleKeyDown);
    
    // Focus first element
    if (this.firstFocusableElement) {
      this.firstFocusableElement.focus();
    }
  }

  /**
   * Deactivate focus trap
   */
  deactivate() {
    document.removeEventListener('keydown', this.handleKeyDown);
  }

  /**
   * Handle tab key navigation
   */
  handleKeyDown(event) {
    if (event.key !== 'Tab') return;

    if (this.focusableElements.length === 0) {
      event.preventDefault();
      return;
    }

    if (event.shiftKey) {
      // Shift + Tab
      if (document.activeElement === this.firstFocusableElement) {
        event.preventDefault();
        this.lastFocusableElement.focus();
      }
    } else {
      // Tab
      if (document.activeElement === this.lastFocusableElement) {
        event.preventDefault();
        this.firstFocusableElement.focus();
      }
    }
  }
}

/**
 * Generates unique IDs for accessibility
 */
export function generateId(prefix = 'ui-component') {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Announces content to screen readers
 */
export function announceToScreenReader(message, priority = 'polite') {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  // Remove after announcement
  setTimeout(() => {
    if (announcement.parentNode) {
      announcement.parentNode.removeChild(announcement);
    }
  }, 1000);
}

/**
 * Manages aria-expanded state
 */
export function toggleAriaExpanded(element, expanded = null) {
  const currentState = element.getAttribute('aria-expanded') === 'true';
  const newState = expanded !== null ? expanded : !currentState;
  element.setAttribute('aria-expanded', newState.toString());
  return newState;
}

/**
 * Debounce function for performance optimization
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}