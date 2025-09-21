/**
 * Accessible Modal Dialog Component
 * Features: ARIA roles, focus trap, keyboard navigation, backdrop click handling
 */

import { FocusTrap, generateId, announceToScreenReader } from '../utils/accessibility.js';

// Track open modals for proper body scroll management
let openModalCount = 0;

export default class Modal {
  constructor(options = {}) {
    this.options = {
      backdrop: true, // Show backdrop
      backdropClose: true, // Close on backdrop click
      keyboard: true, // Close on Escape key
      focus: true, // Auto focus first element
      restoreFocus: true, // Restore focus to trigger element
      closeButton: true, // Show close button
      ...options
    };

    this.id = generateId('modal');
    this.isOpen = false;
    this.triggerElement = null;
    this.modal = null;
    this.backdrop = null;
    this.focusTrap = null;
    this.closeButton = null;

    // Bind methods
    this.handleKeydown = this.handleKeydown.bind(this);
    this.handleBackdropClick = this.handleBackdropClick.bind(this);
    this.close = this.close.bind(this);

    // Event callbacks
    this.callbacks = {
      beforeOpen: [],
      afterOpen: [],
      beforeClose: [],
      afterClose: []
    };

    this.create();
  }

  /**
   * Create modal DOM structure
   */
  create() {
    // Create backdrop
    this.backdrop = document.createElement('div');
    this.backdrop.className = 'modal-backdrop';
    this.backdrop.setAttribute('aria-hidden', 'true');

    // Create modal container
    this.modal = document.createElement('div');
    this.modal.className = 'modal';
    this.modal.id = this.id;
    this.modal.setAttribute('role', 'dialog');
    this.modal.setAttribute('aria-modal', 'true');
    this.modal.setAttribute('aria-hidden', 'true');
    this.modal.setAttribute('tabindex', '-1');

    // Create modal dialog
    const dialog = document.createElement('div');
    dialog.className = 'modal-dialog';
    dialog.setAttribute('role', 'document');

    // Create modal content
    const content = document.createElement('div');
    content.className = 'modal-content';

    // Create header with close button if enabled
    if (this.options.closeButton) {
      const header = document.createElement('div');
      header.className = 'modal-header';

      this.closeButton = document.createElement('button');
      this.closeButton.type = 'button';
      this.closeButton.className = 'modal-close';
      this.closeButton.setAttribute('aria-label', 'Close modal');
      this.closeButton.innerHTML = '&times;';
      this.closeButton.addEventListener('click', this.close);

      header.appendChild(this.closeButton);
      content.appendChild(header);
    }

    // Create body
    const body = document.createElement('div');
    body.className = 'modal-body';
    content.appendChild(body);

    // Create footer
    const footer = document.createElement('div');
    footer.className = 'modal-footer';
    content.appendChild(footer);

    // Assemble modal
    dialog.appendChild(content);
    this.modal.appendChild(dialog);

    // Add backdrop click handler
    if (this.options.backdrop && this.options.backdropClose) {
      this.backdrop.addEventListener('click', this.handleBackdropClick);
      // Only listen on backdrop, not modal itself to avoid bubble issues
    }

    // Initialize focus trap
    this.focusTrap = new FocusTrap(this.modal);
  }

  /**
   * Set modal title
   */
  setTitle(title) {
    let titleElement = this.modal.querySelector('.modal-title');
    if (!titleElement) {
      titleElement = document.createElement('h2');
      titleElement.className = 'modal-title';
      titleElement.id = `${this.id}-title`;
      
      const header = this.modal.querySelector('.modal-header');
      if (header && this.closeButton) {
        header.insertBefore(titleElement, this.closeButton);
      } else if (header) {
        header.appendChild(titleElement);
      } else {
        const content = this.modal.querySelector('.modal-content');
        content.insertBefore(titleElement, content.firstChild);
      }
    }
    
    titleElement.textContent = title;
    this.modal.setAttribute('aria-labelledby', titleElement.id);
    return this;
  }

  /**
   * Set modal body content
   */
  setBody(content) {
    const body = this.modal.querySelector('.modal-body');
    if (typeof content === 'string') {
      body.innerHTML = content;
    } else if (content instanceof Element) {
      body.innerHTML = '';
      body.appendChild(content);
    }
    return this;
  }

  /**
   * Set modal footer content
   */
  setFooter(content) {
    const footer = this.modal.querySelector('.modal-footer');
    if (typeof content === 'string') {
      footer.innerHTML = content;
    } else if (content instanceof Element) {
      footer.innerHTML = '';
      footer.appendChild(content);
    }
    return this;
  }

  /**
   * Add event listener
   */
  on(event, callback) {
    if (this.callbacks[event]) {
      this.callbacks[event].push(callback);
    }
    return this;
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
    return this;
  }

  /**
   * Emit event
   */
  emit(event, data = {}) {
    if (this.callbacks[event]) {
      this.callbacks[event].forEach(callback => callback(data));
    }
  }

  /**
   * Open modal
   */
  open(triggerElement = null) {
    if (this.isOpen) return this;

    this.triggerElement = triggerElement || document.activeElement;
    this.isOpen = true; // Set immediately for synchronous access
    openModalCount++; // Increment modal counter

    // Emit before open event
    this.emit('beforeOpen', { modal: this });

    // Add to DOM
    document.body.appendChild(this.backdrop);
    document.body.appendChild(this.modal);

    // Set ARIA attributes immediately 
    this.modal.setAttribute('aria-hidden', 'false');
    this.backdrop.setAttribute('aria-hidden', 'false');

    // Show modal
    requestAnimationFrame(() => {
      if (this.options.backdrop) {
        this.backdrop.classList.add('show');
      }
      this.modal.classList.add('show');

      // Prevent body scroll only for first modal
      if (openModalCount === 1) {
        document.body.style.overflow = 'hidden';
      }

      // Set up keyboard handling
      if (this.options.keyboard) {
        document.addEventListener('keydown', this.handleKeydown);
      }

      // Set up focus trap
      if (this.options.focus) {
        this.focusTrap.activate();
      }

      // Announce to screen readers
      announceToScreenReader('Modal dialog opened');

      // Emit after open event
      this.emit('afterOpen', { modal: this });
    });

    return this;
  }

  /**
   * Close modal
   */
  close() {
    if (!this.isOpen) return this;

    this.isOpen = false; // Set immediately for synchronous access
    openModalCount = Math.max(0, openModalCount - 1); // Decrement modal counter

    // Emit before close event
    this.emit('beforeClose', { modal: this });

    // Hide modal and set ARIA attributes immediately
    this.modal.classList.remove('show');
    this.backdrop.classList.remove('show');
    this.modal.setAttribute('aria-hidden', 'true');
    this.backdrop.setAttribute('aria-hidden', 'true');

    // Handle transition end with protection against double execution
    let finished = false;
    const handleTransitionEnd = () => {
      if (finished) return;
      finished = true;
      
      this.modal.removeEventListener('transitionend', handleTransitionEnd);
      
      // Remove from DOM
      if (this.modal.parentNode) {
        document.body.removeChild(this.modal);
      }
      if (this.backdrop.parentNode) {
        document.body.removeChild(this.backdrop);
      }

      // Restore body scroll only when no modals are open
      if (openModalCount === 0) {
        document.body.style.overflow = '';
      }

      // Remove keyboard handling
      document.removeEventListener('keydown', this.handleKeydown);

      // Deactivate focus trap
      this.focusTrap.deactivate();

      // Restore focus safely
      if (this.options.restoreFocus && this.triggerElement?.focus) {
        try {
          this.triggerElement.focus();
        } catch (e) {
          // Focus may fail if element was removed from DOM or not focusable
          console.warn('Failed to restore focus to trigger element:', e);
        }
      }

      this.triggerElement = null;

      // Announce to screen readers
      announceToScreenReader('Modal dialog closed');

      // Emit after close event
      this.emit('afterClose', { modal: this });
    };

    // Listen for transition end
    this.modal.addEventListener('transitionend', handleTransitionEnd);

    // Fallback if no transition
    setTimeout(handleTransitionEnd, 300);

    return this;
  }

  /**
   * Toggle modal
   */
  toggle(triggerElement = null) {
    return this.isOpen ? this.close() : this.open(triggerElement);
  }

  /**
   * Handle keyboard events
   */
  handleKeydown(event) {
    if (this.options.keyboard && event.key === 'Escape') {
      event.preventDefault();
      this.close();
    }
  }

  /**
   * Handle backdrop click
   */
  handleBackdropClick(event) {
    if (event.target === this.backdrop || 
        (event.target === this.modal && !this.modal.querySelector('.modal-dialog').contains(event.target))) {
      this.close();
    }
  }

  /**
   * Destroy modal
   */
  destroy() {
    if (this.isOpen) {
      this.close();
    }
    
    // Wait for close animation to complete before cleanup
    setTimeout(() => {
      // Remove event listeners
      if (this.closeButton) {
        this.closeButton.removeEventListener('click', this.close);
      }
      if (this.backdrop) {
        this.backdrop.removeEventListener('click', this.handleBackdropClick);
      }
      if (this.modal) {
        this.modal.removeEventListener('click', this.handleBackdropClick);
      }
      
      // Remove from DOM if still present
      if (this.modal?.parentNode) {
        this.modal.parentNode.removeChild(this.modal);
      }
      if (this.backdrop?.parentNode) {
        this.backdrop.parentNode.removeChild(this.backdrop);
      }
      
      // Clean up focus trap
      if (this.focusTrap) {
        this.focusTrap.deactivate();
        this.focusTrap = null;
      }
      
      // Clear callbacks
      Object.keys(this.callbacks).forEach(key => {
        this.callbacks[key] = [];
      });
      
      this.modal = null;
      this.backdrop = null;
    }, this.options.animationDuration || 300);
  }

  /**
   * Static method to create modal from data attributes
   */
  static fromElement(element) {
    const options = {
      backdrop: element.dataset.backdrop !== 'false',
      backdropClose: element.dataset.backdropClose !== 'false',
      keyboard: element.dataset.keyboard !== 'false',
      focus: element.dataset.focus !== 'false',
      restoreFocus: element.dataset.restoreFocus !== 'false',
      closeButton: element.dataset.closeButton !== 'false'
    };

    const modal = new Modal(options);

    // Set content from data attributes
    if (element.dataset.title) {
      modal.setTitle(element.dataset.title);
    }
    if (element.dataset.body) {
      modal.setBody(element.dataset.body);
    }
    if (element.dataset.footer) {
      modal.setFooter(element.dataset.footer);
    }

    return modal;
  }
}