/**
 * Accessibility utilities tests
 */

import { 
  FocusTrap, 
  generateId, 
  announceToScreenReader, 
  toggleAriaExpanded, 
  debounce 
} from '../src/utils/accessibility.js';

describe('Accessibility Utilities', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('FocusTrap', () => {
    let container;
    let focusTrap;

    beforeEach(() => {
      container = createTestElement('div', {}, [
        createTestElement('button', { id: 'first' }, ['First']),
        createTestElement('input', { type: 'text', id: 'middle' }),
        createTestElement('button', { id: 'last' }, ['Last'])
      ]);
      document.body.appendChild(container);
      focusTrap = new FocusTrap(container);
    });

    afterEach(() => {
      if (focusTrap) {
        focusTrap.deactivate();
      }
    });

    test('finds focusable elements', () => {
      focusTrap.getFocusableElements();
      expect(focusTrap.focusableElements).toHaveLength(3);
      expect(focusTrap.firstFocusableElement.id).toBe('first');
      expect(focusTrap.lastFocusableElement.id).toBe('last');
    });

    test('excludes disabled elements', () => {
      const disabledButton = container.querySelector('#last');
      disabledButton.disabled = true;
      
      focusTrap.getFocusableElements();
      expect(focusTrap.focusableElements).toHaveLength(2);
      expect(focusTrap.lastFocusableElement.id).toBe('middle');
    });

    test('excludes hidden elements', () => {
      const hiddenInput = container.querySelector('#middle');
      hiddenInput.style.display = 'none';
      
      focusTrap.getFocusableElements();
      expect(focusTrap.focusableElements).toHaveLength(2);
    });

    test('activates focus trap', () => {
      const firstButton = container.querySelector('#first');
      const focusSpy = jest.spyOn(firstButton, 'focus');
      
      focusTrap.activate();
      expect(focusSpy).toHaveBeenCalled();
    });

    test('handles tab navigation forward', () => {
      focusTrap.activate();
      const lastButton = container.querySelector('#last');
      lastButton.focus();
      
      const event = new KeyboardEvent('keydown', { key: 'Tab' });
      const preventDefaultSpy = jest.spyOn(event, 'preventDefault');
      const firstButton = container.querySelector('#first');
      const focusSpy = jest.spyOn(firstButton, 'focus');
      
      document.dispatchEvent(event);
      expect(preventDefaultSpy).toHaveBeenCalled();
      expect(focusSpy).toHaveBeenCalled();
    });

    test('handles tab navigation backward', () => {
      focusTrap.activate();
      const firstButton = container.querySelector('#first');
      firstButton.focus();
      
      const event = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true });
      const preventDefaultSpy = jest.spyOn(event, 'preventDefault');
      const lastButton = container.querySelector('#last');
      const focusSpy = jest.spyOn(lastButton, 'focus');
      
      document.dispatchEvent(event);
      expect(preventDefaultSpy).toHaveBeenCalled();
      expect(focusSpy).toHaveBeenCalled();
    });

    test('ignores non-tab keys', () => {
      focusTrap.activate();
      const event = new KeyboardEvent('keydown', { key: 'Enter' });
      const preventDefaultSpy = jest.spyOn(event, 'preventDefault');
      
      document.dispatchEvent(event);
      expect(preventDefaultSpy).not.toHaveBeenCalled();
    });

    test('handles empty focusable elements', () => {
      const emptyContainer = createTestElement('div');
      document.body.appendChild(emptyContainer);
      const emptyFocusTrap = new FocusTrap(emptyContainer);
      
      emptyFocusTrap.activate();
      const event = new KeyboardEvent('keydown', { key: 'Tab' });
      const preventDefaultSpy = jest.spyOn(event, 'preventDefault');
      
      document.dispatchEvent(event);
      expect(preventDefaultSpy).toHaveBeenCalled();
      
      emptyFocusTrap.deactivate();
    });

    test('deactivates focus trap', () => {
      const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');
      focusTrap.activate();
      focusTrap.deactivate();
      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', focusTrap.handleKeyDown);
    });
  });

  describe('generateId', () => {
    test('generates unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^ui-component-/);
      expect(id2).toMatch(/^ui-component-/);
    });

    test('uses custom prefix', () => {
      const id = generateId('custom-prefix');
      expect(id).toMatch(/^custom-prefix-/);
    });
  });

  describe('announceToScreenReader', () => {
    test('creates announcement element', () => {
      announceToScreenReader('Test announcement');
      
      const announcement = document.querySelector('.sr-only');
      expect(announcement).toBeTruthy();
      expect(announcement.textContent).toBe('Test announcement');
      expect(announcement.getAttribute('aria-live')).toBe('polite');
      expect(announcement.getAttribute('aria-atomic')).toBe('true');
    });

    test('uses custom priority', () => {
      announceToScreenReader('Urgent message', 'assertive');
      
      const announcement = document.querySelector('.sr-only');
      expect(announcement.getAttribute('aria-live')).toBe('assertive');
    });

    test('removes announcement after timeout', (done) => {
      announceToScreenReader('Temporary message');
      
      const announcement = document.querySelector('.sr-only');
      expect(announcement).toBeTruthy();
      
      setTimeout(() => {
        expect(document.querySelector('.sr-only')).toBeNull();
        done();
      }, 1100);
    });
  });

  describe('toggleAriaExpanded', () => {
    test('toggles aria-expanded attribute', () => {
      const element = createTestElement('button', { 'aria-expanded': 'false' });
      
      const result = toggleAriaExpanded(element);
      expect(result).toBe(true);
      expect(element.getAttribute('aria-expanded')).toBe('true');
      
      const result2 = toggleAriaExpanded(element);
      expect(result2).toBe(false);
      expect(element.getAttribute('aria-expanded')).toBe('false');
    });

    test('sets specific expanded state', () => {
      const element = createTestElement('button', { 'aria-expanded': 'false' });
      
      const result = toggleAriaExpanded(element, true);
      expect(result).toBe(true);
      expect(element.getAttribute('aria-expanded')).toBe('true');
      
      const result2 = toggleAriaExpanded(element, true);
      expect(result2).toBe(true);
      expect(element.getAttribute('aria-expanded')).toBe('true');
    });

    test('handles missing aria-expanded attribute', () => {
      const element = createTestElement('button');
      
      const result = toggleAriaExpanded(element);
      expect(result).toBe(true);
      expect(element.getAttribute('aria-expanded')).toBe('true');
    });
  });

  describe('debounce', () => {
    test('delays function execution', (done) => {
      const callback = jest.fn();
      const debouncedFn = debounce(callback, 100);
      
      debouncedFn();
      expect(callback).not.toHaveBeenCalled();
      
      setTimeout(() => {
        expect(callback).toHaveBeenCalledTimes(1);
        done();
      }, 150);
    });

    test('cancels previous execution', (done) => {
      const callback = jest.fn();
      const debouncedFn = debounce(callback, 100);
      
      debouncedFn();
      debouncedFn();
      debouncedFn();
      
      setTimeout(() => {
        expect(callback).toHaveBeenCalledTimes(1);
        done();
      }, 150);
    });

    test('passes arguments to callback', (done) => {
      const callback = jest.fn();
      const debouncedFn = debounce(callback, 50);
      
      debouncedFn('arg1', 'arg2');
      
      setTimeout(() => {
        expect(callback).toHaveBeenCalledWith('arg1', 'arg2');
        done();
      }, 100);
    });
  });
});