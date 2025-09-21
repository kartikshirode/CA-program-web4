/**
 * Tabs component tests
 */

import Tabs from '../src/components/Tabs.js';

describe('Tabs Component', () => {
  let tabs;
  let container;

  beforeEach(() => {
    container = createTestElement('div', { className: 'tabs' }, [
      createTestElement('div', { className: 'tab-panel', 'data-title': 'Tab 1' }, ['Content 1']),
      createTestElement('div', { className: 'tab-panel', 'data-title': 'Tab 2' }, ['Content 2']),
      createTestElement('div', { className: 'tab-panel', 'data-title': 'Tab 3' }, ['Content 3'])
    ]);
    document.body.appendChild(container);
    tabs = new Tabs(container);
  });

  afterEach(() => {
    if (tabs) {
      tabs.destroy();
    }
    document.body.innerHTML = '';
  });

  describe('Initialization', () => {
    test('creates tab navigation structure', () => {
      const tabList = container.querySelector('.tabs-nav');
      expect(tabList).toBeTruthy();
      expect(tabList.getAttribute('role')).toBe('tablist');
      expect(tabList.getAttribute('aria-orientation')).toBe('horizontal');
    });

    test('creates tab buttons from panels', () => {
      const tabButtons = container.querySelectorAll('.tab-button');
      expect(tabButtons).toHaveLength(3);
      expect(tabButtons[0].textContent).toBe('Tab 1');
      expect(tabButtons[1].textContent).toBe('Tab 2');
      expect(tabButtons[2].textContent).toBe('Tab 3');
    });

    test('sets up accessibility attributes', () => {
      const tabButtons = container.querySelectorAll('.tab-button');
      const panels = container.querySelectorAll('.tab-panel');

      tabButtons.forEach((tab, index) => {
        expect(tab.getAttribute('role')).toBe('tab');
        expect(tab.getAttribute('aria-controls')).toBe(panels[index].id);
        expect(tab.getAttribute('aria-selected')).toBe(index === 0 ? 'true' : 'false');
      });

      panels.forEach((panel, index) => {
        expect(panel.getAttribute('role')).toBe('tabpanel');
        expect(panel.getAttribute('aria-labelledby')).toBe(tabButtons[index].id);
        expect(panel.getAttribute('tabindex')).toBe('0');
      });
    });

    test('activates first tab by default', () => {
      expect(tabs.activeIndex).toBe(0);
      
      const firstTab = container.querySelector('.tab-button');
      const firstPanel = container.querySelector('.tab-panel');
      
      expect(firstTab.getAttribute('aria-selected')).toBe('true');
      expect(firstTab.getAttribute('tabindex')).toBe('0');
      expect(firstPanel.hidden).toBe(false);
    });

    test('applies custom options', () => {
      const verticalTabs = new Tabs(container, { orientation: 'vertical' });
      const tabList = container.querySelector('.tabs-nav');
      expect(tabList.getAttribute('aria-orientation')).toBe('vertical');
      verticalTabs.destroy();
    });
  });

  describe('Tab Activation', () => {
    test('activates tab by index', () => {
      tabs.activateTab(1);
      expect(tabs.activeIndex).toBe(1);
      
      const tabButtons = container.querySelectorAll('.tab-button');
      const panels = container.querySelectorAll('.tab-panel');
      
      expect(tabButtons[0].getAttribute('aria-selected')).toBe('false');
      expect(tabButtons[1].getAttribute('aria-selected')).toBe('true');
      expect(panels[0].hidden).toBe(true);
      expect(panels[1].hidden).toBe(false);
    });

    test('does not activate invalid index', () => {
      const originalIndex = tabs.activeIndex;
      tabs.activateTab(-1);
      expect(tabs.activeIndex).toBe(originalIndex);
      
      tabs.activateTab(10);
      expect(tabs.activeIndex).toBe(originalIndex);
    });

    test('does not activate same tab', () => {
      const beforeActivateSpy = jest.fn();
      tabs.on('beforeActivate', beforeActivateSpy);
      
      tabs.activateTab(0); // Already active
      expect(beforeActivateSpy).not.toHaveBeenCalled();
    });
  });

  describe('Mouse Interaction', () => {
    test('activates tab on click', () => {
      const secondTab = container.querySelectorAll('.tab-button')[1];
      triggerEvent(secondTab, 'click');
      expect(tabs.activeIndex).toBe(1);
    });

    test('prevents default on tab click', () => {
      const secondTab = container.querySelectorAll('.tab-button')[1];
      const event = triggerEvent(secondTab, 'click');
      expect(event.defaultPrevented).toBe(true);
    });
  });

  describe('Keyboard Navigation', () => {
    beforeEach(() => {
      // Focus first tab
      container.querySelector('.tab-button').focus();
    });

    test('navigates to next tab with ArrowRight', () => {
      const firstTab = container.querySelector('.tab-button');
      triggerKeyEvent(firstTab, 'keydown', 'ArrowRight');
      expect(tabs.activeIndex).toBe(1);
    });

    test('navigates to previous tab with ArrowLeft', () => {
      tabs.activateTab(1);
      const secondTab = container.querySelectorAll('.tab-button')[1];
      triggerKeyEvent(secondTab, 'keydown', 'ArrowLeft');
      expect(tabs.activeIndex).toBe(0);
    });

    test('wraps to first tab from last with ArrowRight', () => {
      tabs.activateTab(2);
      const lastTab = container.querySelectorAll('.tab-button')[2];
      triggerKeyEvent(lastTab, 'keydown', 'ArrowRight');
      expect(tabs.activeIndex).toBe(0);
    });

    test('wraps to last tab from first with ArrowLeft', () => {
      const firstTab = container.querySelector('.tab-button');
      triggerKeyEvent(firstTab, 'keydown', 'ArrowLeft');
      expect(tabs.activeIndex).toBe(2);
    });

    test('goes to first tab with Home key', () => {
      tabs.activateTab(2);
      const lastTab = container.querySelectorAll('.tab-button')[2];
      triggerKeyEvent(lastTab, 'keydown', 'Home');
      expect(tabs.activeIndex).toBe(0);
    });

    test('goes to last tab with End key', () => {
      const firstTab = container.querySelector('.tab-button');
      triggerKeyEvent(firstTab, 'keydown', 'End');
      expect(tabs.activeIndex).toBe(2);
    });

    test('activates tab with Enter key', () => {
      tabs.activateTab(1);
      const secondTab = container.querySelectorAll('.tab-button')[1];
      triggerKeyEvent(secondTab, 'keydown', 'Enter');
      expect(tabs.activeIndex).toBe(1);
    });

    test('activates tab with Space key', () => {
      tabs.activateTab(1);
      const secondTab = container.querySelectorAll('.tab-button')[1];
      triggerKeyEvent(secondTab, 'keydown', ' ');
      expect(tabs.activeIndex).toBe(1);
    });
  });

  describe('Vertical Orientation', () => {
    beforeEach(() => {
      tabs.destroy();
      tabs = new Tabs(container, { orientation: 'vertical' });
    });

    test('uses arrow down for next tab', () => {
      const firstTab = container.querySelector('.tab-button');
      triggerKeyEvent(firstTab, 'keydown', 'ArrowDown');
      expect(tabs.activeIndex).toBe(1);
    });

    test('uses arrow up for previous tab', () => {
      tabs.activateTab(1);
      const secondTab = container.querySelectorAll('.tab-button')[1];
      triggerKeyEvent(secondTab, 'keydown', 'ArrowUp');
      expect(tabs.activeIndex).toBe(0);
    });

    test('ignores horizontal arrow keys', () => {
      const firstTab = container.querySelector('.tab-button');
      triggerKeyEvent(firstTab, 'keydown', 'ArrowRight');
      expect(tabs.activeIndex).toBe(0);
    });
  });

  describe('Focus Management', () => {
    test('sets correct tabindex values', () => {
      const tabButtons = container.querySelectorAll('.tab-button');
      expect(tabButtons[0].getAttribute('tabindex')).toBe('0');
      expect(tabButtons[1].getAttribute('tabindex')).toBe('-1');
      expect(tabButtons[2].getAttribute('tabindex')).toBe('-1');
      
      tabs.activateTab(1);
      expect(tabButtons[0].getAttribute('tabindex')).toBe('-1');
      expect(tabButtons[1].getAttribute('tabindex')).toBe('0');
      expect(tabButtons[2].getAttribute('tabindex')).toBe('-1');
    });

    test('focuses tab when using focusTab method', () => {
      const secondTab = container.querySelectorAll('.tab-button')[1];
      const focusSpy = jest.spyOn(secondTab, 'focus');
      tabs.focusTab(1);
      expect(focusSpy).toHaveBeenCalled();
    });
  });

  describe('Dynamic Tab Management', () => {
    test('adds new tab', () => {
      const result = tabs.addTab('New Tab', '<p>New content</p>');
      expect(result.tab).toBeTruthy();
      expect(result.panel).toBeTruthy();
      expect(tabs.tabs).toHaveLength(4);
      expect(tabs.panels).toHaveLength(4);
      expect(result.tab.textContent).toBe('New Tab');
      expect(result.panel.innerHTML).toBe('<p>New content</p>');
    });

    test('adds tab at specific index', () => {
      tabs.addTab('Insert Tab', 'Insert content', 1);
      expect(tabs.tabs).toHaveLength(4);
      expect(tabs.tabs[1].textContent).toBe('Insert Tab');
    });

    test('removes tab by index', () => {
      tabs.removeTab(1);
      expect(tabs.tabs).toHaveLength(2);
      expect(tabs.panels).toHaveLength(2);
      expect(tabs.tabs[1].textContent).toBe('Tab 3');
    });

    test('adjusts active index when removing active tab', () => {
      tabs.activateTab(1);
      tabs.removeTab(1);
      expect(tabs.activeIndex).toBe(1); // Should activate tab 3 (now at index 1)
    });

    test('adjusts active index when removing tab before active', () => {
      tabs.activateTab(2);
      tabs.removeTab(0);
      expect(tabs.activeIndex).toBe(1); // Active index decreases by 1
    });
  });

  describe('Events', () => {
    test('emits beforeActivate event', () => {
      const beforeActivateSpy = jest.fn();
      tabs.on('beforeActivate', beforeActivateSpy);
      
      tabs.activateTab(1);
      expect(beforeActivateSpy).toHaveBeenCalledWith({
        tab: tabs.tabs[1],
        panel: tabs.panels[1],
        index: 1
      });
    });

    test('emits afterActivate event', () => {
      const afterActivateSpy = jest.fn();
      tabs.on('afterActivate', afterActivateSpy);
      
      tabs.activateTab(1);
      expect(afterActivateSpy).toHaveBeenCalledWith({
        tab: tabs.tabs[1],
        panel: tabs.panels[1],
        index: 1
      });
    });

    test('emits beforeDeactivate event', () => {
      const beforeDeactivateSpy = jest.fn();
      tabs.on('beforeDeactivate', beforeDeactivateSpy);
      
      tabs.activateTab(1);
      expect(beforeDeactivateSpy).toHaveBeenCalledWith({
        tab: tabs.tabs[0],
        panel: tabs.panels[0],
        index: 0
      });
    });

    test('emits afterDeactivate event', () => {
      const afterDeactivateSpy = jest.fn();
      tabs.on('afterDeactivate', afterDeactivateSpy);
      
      tabs.activateTab(1);
      expect(afterDeactivateSpy).toHaveBeenCalledWith({
        tab: tabs.tabs[0],
        panel: tabs.panels[0],
        index: 0
      });
    });

    test('removes event listeners', () => {
      const callback = jest.fn();
      tabs.on('beforeActivate', callback);
      tabs.off('beforeActivate', callback);
      
      tabs.activateTab(1);
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('Getters', () => {
    test('returns active index', () => {
      expect(tabs.getActiveIndex()).toBe(0);
      tabs.activateTab(2);
      expect(tabs.getActiveIndex()).toBe(2);
    });

    test('returns active tab element', () => {
      const activeTab = tabs.getActiveTab();
      expect(activeTab).toBe(tabs.tabs[0]);
      
      tabs.activateTab(1);
      const newActiveTab = tabs.getActiveTab();
      expect(newActiveTab).toBe(tabs.tabs[1]);
    });

    test('returns active panel element', () => {
      const activePanel = tabs.getActivePanel();
      expect(activePanel).toBe(tabs.panels[0]);
      
      tabs.activateTab(2);
      const newActivePanel = tabs.getActivePanel();
      expect(newActivePanel).toBe(tabs.panels[2]);
    });
  });

  describe('Static Methods', () => {
    test('creates tabs from element with data attributes', () => {
      const element = createTestElement('div', {
        'data-orientation': 'vertical',
        'data-activate-on-focus': 'true'
      });
      
      const staticTabs = Tabs.fromElement(element);
      expect(staticTabs.options.orientation).toBe('vertical');
      expect(staticTabs.options.activateOnFocus).toBe(true);
      
      staticTabs.destroy();
    });
  });

  describe('Destruction', () => {
    test('cleans up event listeners', () => {
      const firstTab = container.querySelector('.tab-button');
      const clickSpy = jest.fn();
      firstTab.addEventListener('click', clickSpy);
      
      tabs.destroy();
      triggerEvent(firstTab, 'click');
      
      // The tab's internal click handler should be removed
      // but our test listener should still work
      expect(clickSpy).toHaveBeenCalled();
      expect(tabs.callbacks.beforeActivate).toHaveLength(0);
    });
  });
});