/**
 * Modal component tests
 */

import Modal from '../src/components/Modal.js';

describe('Modal Component', () => {
  let modal;
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    modal = new Modal();
  });

  afterEach(() => {
    if (modal) {
      modal.destroy();
    }
    document.body.innerHTML = '';
  });

  describe('Initialization', () => {
    test('creates modal with correct structure', () => {
      expect(modal.modal).toBeDefined();
      expect(modal.backdrop).toBeDefined();
      expect(modal.modal.getAttribute('role')).toBe('dialog');
      expect(modal.modal.getAttribute('aria-modal')).toBe('true');
      expect(modal.modal.getAttribute('aria-hidden')).toBe('true');
    });

    test('generates unique ID', () => {
      const modal2 = new Modal();
      expect(modal.id).toBeDefined();
      expect(modal2.id).toBeDefined();
      expect(modal.id).not.toBe(modal2.id);
      modal2.destroy();
    });

    test('applies default options', () => {
      expect(modal.options.backdrop).toBe(true);
      expect(modal.options.backdropClose).toBe(true);
      expect(modal.options.keyboard).toBe(true);
      expect(modal.options.focus).toBe(true);
    });

    test('applies custom options', () => {
      const customModal = new Modal({
        backdrop: false,
        keyboard: false,
        closeButton: false
      });
      expect(customModal.options.backdrop).toBe(false);
      expect(customModal.options.keyboard).toBe(false);
      expect(customModal.options.closeButton).toBe(false);
      customModal.destroy();
    });
  });

  describe('Content Management', () => {
    test('sets modal title', () => {
      modal.setTitle('Test Title');
      const titleElement = modal.modal.querySelector('.modal-title');
      expect(titleElement).toBeTruthy();
      expect(titleElement.textContent).toBe('Test Title');
      expect(modal.modal.getAttribute('aria-labelledby')).toBe(titleElement.id);
    });

    test('sets modal body content', () => {
      modal.setBody('<p>Test content</p>');
      const bodyElement = modal.modal.querySelector('.modal-body');
      expect(bodyElement.innerHTML).toBe('<p>Test content</p>');
    });

    test('sets modal body with DOM element', () => {
      const element = document.createElement('div');
      element.textContent = 'Test element';
      modal.setBody(element);
      const bodyElement = modal.modal.querySelector('.modal-body');
      expect(bodyElement.contains(element)).toBe(true);
    });

    test('sets modal footer content', () => {
      modal.setFooter('<button>OK</button>');
      const footerElement = modal.modal.querySelector('.modal-footer');
      expect(footerElement.innerHTML).toBe('<button>OK</button>');
    });
  });

  describe('Opening and Closing', () => {
    test('opens modal', async () => {
      modal.open();
      expect(modal.isOpen).toBe(true);
      expect(document.body.contains(modal.modal)).toBe(true);
      expect(document.body.contains(modal.backdrop)).toBe(true);
      
      await nextTick();
      expect(modal.modal.classList.contains('show')).toBe(true);
      expect(modal.modal.getAttribute('aria-hidden')).toBe('false');
    });

    test('closes modal', async () => {
      modal.open();
      await nextTick();
      
      modal.close();
      expect(modal.isOpen).toBe(false);
      expect(modal.modal.classList.contains('show')).toBe(false);
    });

    test('toggles modal', async () => {
      expect(modal.isOpen).toBe(false);
      
      modal.toggle();
      expect(modal.isOpen).toBe(true);
      
      await nextTick();
      modal.toggle();
      expect(modal.isOpen).toBe(false);
    });

    test('prevents body scroll when open', async () => {
      modal.open();
      await nextTick();
      expect(document.body.style.overflow).toBe('hidden');
      
      modal.close();
      await new Promise(resolve => setTimeout(resolve, 350)); // Wait for transition
      expect(document.body.style.overflow).toBe('');
    });
  });

  describe('Keyboard Navigation', () => {
    test('closes modal on Escape key', async () => {
      modal.open();
      await nextTick();
      
      triggerKeyEvent(document, 'keydown', 'Escape');
      expect(modal.isOpen).toBe(false);
    });

    test('does not close on Escape when keyboard disabled', async () => {
      const noKeyboardModal = new Modal({ keyboard: false });
      noKeyboardModal.open();
      await nextTick();
      
      triggerKeyEvent(document, 'keydown', 'Escape');
      expect(noKeyboardModal.isOpen).toBe(true);
      
      noKeyboardModal.destroy();
    });
  });

  describe('Focus Management', () => {
    test('creates focus trap', () => {
      expect(modal.focusTrap).toBeDefined();
    });

    test('activates focus trap when opened', async () => {
      const activateSpy = jest.spyOn(modal.focusTrap, 'activate');
      modal.open();
      await nextTick();
      expect(activateSpy).toHaveBeenCalled();
    });

    test('deactivates focus trap when closed', async () => {
      const deactivateSpy = jest.spyOn(modal.focusTrap, 'deactivate');
      modal.open();
      await nextTick();
      modal.close();
      
      // Wait for transition to complete
      await new Promise(resolve => setTimeout(resolve, 350));
      
      expect(deactivateSpy).toHaveBeenCalled();
    });
  });

  describe('Backdrop Interaction', () => {
    test('closes modal on backdrop click', async () => {
      modal.open();
      await nextTick();
      
      triggerEvent(modal.backdrop, 'click');
      expect(modal.isOpen).toBe(false);
    });

    test('does not close on backdrop click when disabled', async () => {
      const noBackdropModal = new Modal({ backdropClose: false });
      noBackdropModal.open();
      await nextTick();
      
      triggerEvent(noBackdropModal.backdrop, 'click');
      expect(noBackdropModal.isOpen).toBe(true);
      
      noBackdropModal.destroy();
    });
  });

  describe('Events', () => {
    test('emits beforeOpen event', () => {
      const beforeOpenSpy = jest.fn();
      modal.on('beforeOpen', beforeOpenSpy);
      
      modal.open();
      expect(beforeOpenSpy).toHaveBeenCalledWith({ modal });
    });

    test('emits afterOpen event', async () => {
      const afterOpenSpy = jest.fn();
      modal.on('afterOpen', afterOpenSpy);
      
      modal.open();
      await nextTick();
      expect(afterOpenSpy).toHaveBeenCalledWith({ modal });
    });

    test('emits beforeClose event', async () => {
      const beforeCloseSpy = jest.fn();
      modal.on('beforeClose', beforeCloseSpy);
      
      modal.open();
      await nextTick();
      modal.close();
      expect(beforeCloseSpy).toHaveBeenCalledWith({ modal });
    });

    test('emits afterClose event', async () => {
      const afterCloseSpy = jest.fn();
      modal.on('afterClose', afterCloseSpy);
      
      modal.open();
      await nextTick();
      modal.close();
      await new Promise(resolve => setTimeout(resolve, 350));
      expect(afterCloseSpy).toHaveBeenCalledWith({ modal });
    });

    test('removes event listeners', () => {
      const callback = jest.fn();
      modal.on('beforeOpen', callback);
      modal.off('beforeOpen', callback);
      
      modal.open();
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('Close Button', () => {
    test('creates close button by default', () => {
      expect(modal.closeButton).toBeTruthy();
      expect(modal.closeButton.getAttribute('aria-label')).toBe('Close modal');
    });

    test('does not create close button when disabled', () => {
      const noCloseModal = new Modal({ closeButton: false });
      expect(noCloseModal.closeButton).toBeNull();
      noCloseModal.destroy();
    });

    test('closes modal when close button clicked', async () => {
      modal.open();
      await nextTick();
      
      triggerEvent(modal.closeButton, 'click');
      expect(modal.isOpen).toBe(false);
    });
  });

  describe('Static Methods', () => {
    test('creates modal from element with data attributes', () => {
      const element = createTestElement('div', {
        'data-backdrop': 'false',
        'data-keyboard': 'false',
        'data-title': 'Test Title',
        'data-body': 'Test Body'
      });
      
      const staticModal = Modal.fromElement(element);
      expect(staticModal.options.backdrop).toBe(false);
      expect(staticModal.options.keyboard).toBe(false);
      
      const titleElement = staticModal.modal.querySelector('.modal-title');
      expect(titleElement.textContent).toBe('Test Title');
      
      const bodyElement = staticModal.modal.querySelector('.modal-body');
      expect(bodyElement.innerHTML).toBe('Test Body');
      
      staticModal.destroy();
    });
  });

  describe('Accessibility', () => {
    test('has correct ARIA attributes', () => {
      expect(modal.modal.getAttribute('role')).toBe('dialog');
      expect(modal.modal.getAttribute('aria-modal')).toBe('true');
      expect(modal.modal.getAttribute('aria-hidden')).toBe('true');
      expect(modal.modal.getAttribute('tabindex')).toBe('-1');
    });

    test('updates aria-hidden when opened/closed', async () => {
      modal.open();
      await nextTick();
      expect(modal.modal.getAttribute('aria-hidden')).toBe('false');
      
      modal.close();
      expect(modal.modal.getAttribute('aria-hidden')).toBe('true');
    });

    test('links title with aria-labelledby', () => {
      modal.setTitle('Test Title');
      const titleElement = modal.modal.querySelector('.modal-title');
      expect(modal.modal.getAttribute('aria-labelledby')).toBe(titleElement.id);
    });
  });

  describe('Destruction', () => {
    test('cleans up event listeners and DOM', async () => {
      modal.open();
      await nextTick();
      
      const modalElement = modal.modal;
      const backdropElement = modal.backdrop;
      
      modal.destroy();
      
      // Wait for destroy animation to complete
      await new Promise(resolve => setTimeout(resolve, 350));
      
      expect(document.body.contains(modalElement)).toBe(false);
      expect(document.body.contains(backdropElement)).toBe(false);
      expect(modal.callbacks.beforeOpen).toHaveLength(0);
    });
  });
});