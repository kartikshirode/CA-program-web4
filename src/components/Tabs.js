/**
 * Accessible Tabs Component
 * Features: Keyboard navigation, ARIA attributes, dynamic content loading
 */

import { generateId, announceToScreenReader, toggleAriaExpanded } from '../utils/accessibility.js';

export default class Tabs {
  constructor(element, options = {}) {
    this.element = element;
    this.options = {
      orientation: 'horizontal', // 'horizontal' or 'vertical'
      activateOnFocus: false, // Activate tabs on focus or click only
      destroyOnHide: false, // Destroy panel content when hidden
      ...options
    };

    this.tabList = null;
    this.tabs = [];
    this.panels = [];
    this.activeIndex = 0;
    this.tabIdPrefix = generateId('tab');
    this.panelIdPrefix = generateId('panel');

    // Bind methods
    this.handleTabClick = this.handleTabClick.bind(this);
    this.handleTabKeydown = this.handleTabKeydown.bind(this);
    this.handleTabFocus = this.handleTabFocus.bind(this);

    // Event callbacks
    this.callbacks = {
      beforeActivate: [],
      afterActivate: [],
      beforeDeactivate: [],
      afterDeactivate: []
    };

    this.init();
  }

  /**
   * Initialize tabs component
   */
  init() {
    this.createTabStructure();
    this.setupAccessibility();
    this.bindEvents();
    this.activateTab(this.activeIndex, false);
  }

  /**
   * Create tab structure from existing content
   */
  createTabStructure() {
    // Find or create tab list
    this.tabList = this.element.querySelector('.tabs-nav') || this.element.querySelector('[role="tablist"]');
    
    if (!this.tabList) {
      this.tabList = document.createElement('div');
      this.tabList.className = 'tabs-nav';
      this.element.insertBefore(this.tabList, this.element.firstChild);
    }

    // Find existing tabs and panels
    const existingTabs = Array.from(this.element.querySelectorAll('.tab-button') || this.element.querySelectorAll('[role="tab"]'));
    const existingPanels = Array.from(this.element.querySelectorAll('.tab-panel') || this.element.querySelectorAll('[role="tabpanel"]'));

    // If no existing tabs, create from panels
    if (existingTabs.length === 0 && existingPanels.length > 0) {
      existingPanels.forEach((panel, index) => {
        const title = panel.dataset.title || panel.querySelector('h1, h2, h3, h4, h5, h6')?.textContent || `Tab ${index + 1}`;
        const tab = this.createTab(title, index);
        this.tabList.appendChild(tab);
        this.tabs.push(tab);
      });
    } else {
      this.tabs = existingTabs;
    }

    this.panels = existingPanels;

    // Ensure we have matching tabs and panels
    if (this.tabs.length !== this.panels.length) {
      console.warn('Tabs: Number of tabs and panels do not match');
    }
  }

  /**
   * Create a tab button
   */
  createTab(title, index) {
    const tab = document.createElement('button');
    tab.type = 'button';
    tab.className = 'tab-button';
    tab.textContent = title;
    tab.dataset.index = index;
    return tab;
  }

  /**
   * Setup accessibility attributes
   */
  setupAccessibility() {
    // Setup tab list
    this.tabList.setAttribute('role', 'tablist');
    this.tabList.setAttribute('aria-orientation', this.options.orientation);

    // Setup tabs and panels
    this.tabs.forEach((tab, index) => {
      const tabId = `${this.tabIdPrefix}-${index}`;
      const panelId = `${this.panelIdPrefix}-${index}`;

      // Setup tab
      tab.id = tabId;
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-controls', panelId);
      tab.setAttribute('aria-selected', 'false');
      tab.setAttribute('tabindex', '-1');

      // Setup panel
      if (this.panels[index]) {
        const panel = this.panels[index];
        panel.id = panelId;
        panel.setAttribute('role', 'tabpanel');
        panel.setAttribute('aria-labelledby', tabId);
        panel.setAttribute('tabindex', '0');
        panel.hidden = true;
      }
    });
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    this.tabs.forEach(tab => {
      tab.addEventListener('click', this.handleTabClick);
      tab.addEventListener('keydown', this.handleTabKeydown);
      if (this.options.activateOnFocus) {
        tab.addEventListener('focus', this.handleTabFocus);
      }
    });
  }

  /**
   * Handle tab click
   */
  handleTabClick(event) {
    event.preventDefault();
    const index = parseInt(event.target.dataset.index, 10);
    this.activateTab(index);
  }

  /**
   * Handle tab focus
   */
  handleTabFocus(event) {
    if (this.options.activateOnFocus) {
      const index = parseInt(event.target.dataset.index, 10);
      this.activateTab(index);
    }
  }

  /**
   * Handle keyboard navigation
   */
  handleTabKeydown(event) {
    const { key } = event;
    const currentIndex = parseInt(event.target.dataset.index, 10);
    let newIndex = currentIndex;

    // Determine navigation based on orientation
    const isHorizontal = this.options.orientation === 'horizontal';
    const nextKey = isHorizontal ? 'ArrowRight' : 'ArrowDown';
    const prevKey = isHorizontal ? 'ArrowLeft' : 'ArrowUp';

    switch (key) {
      case nextKey:
        event.preventDefault();
        newIndex = (currentIndex + 1) % this.tabs.length;
        this.focusTab(newIndex);
        if (!this.options.activateOnFocus) {
          this.activateTab(newIndex);
        }
        break;

      case prevKey:
        event.preventDefault();
        newIndex = currentIndex === 0 ? this.tabs.length - 1 : currentIndex - 1;
        this.focusTab(newIndex);
        if (!this.options.activateOnFocus) {
          this.activateTab(newIndex);
        }
        break;

      case 'Home':
        event.preventDefault();
        this.focusTab(0);
        if (!this.options.activateOnFocus) {
          this.activateTab(0);
        }
        break;

      case 'End':
        event.preventDefault();
        this.focusTab(this.tabs.length - 1);
        if (!this.options.activateOnFocus) {
          this.activateTab(this.tabs.length - 1);
        }
        break;

      case 'Enter':
      case ' ':
        event.preventDefault();
        this.activateTab(currentIndex);
        break;
    }
  }

  /**
   * Focus a specific tab
   */
  focusTab(index) {
    if (this.tabs[index]) {
      this.tabs[index].focus();
    }
  }

  /**
   * Activate a tab
   */
  activateTab(index, announce = true) {
    if (index < 0 || index >= this.tabs.length) {
      return;
    }

    // Skip early return if this is the initial activation
    if (index === this.activeIndex && this.tabs[index].getAttribute('aria-selected') === 'true') {
      return;
    }

    const previousIndex = this.activeIndex;

    // Only emit events if we have a valid previous tab
    if (previousIndex >= 0 && previousIndex < this.tabs.length) {
      // Emit before deactivate event
      this.emit('beforeDeactivate', { 
        tab: this.tabs[previousIndex], 
        panel: this.panels[previousIndex], 
        index: previousIndex 
      });
    }

    // Emit before activate event
    this.emit('beforeActivate', { 
      tab: this.tabs[index], 
      panel: this.panels[index], 
      index 
    });

    // Deactivate current tab (only if different from new tab)
    if (previousIndex >= 0 && previousIndex !== index && this.tabs[previousIndex]) {
      this.tabs[previousIndex].setAttribute('aria-selected', 'false');
      this.tabs[previousIndex].setAttribute('tabindex', '-1');
      this.tabs[previousIndex].classList.remove('active');
    }

    if (previousIndex >= 0 && previousIndex !== index && this.panels[previousIndex]) {
      this.panels[previousIndex].hidden = true;
      this.panels[previousIndex].classList.remove('active');
      
      // Destroy content if option is enabled
      if (this.options.destroyOnHide) {
        this.panels[previousIndex].innerHTML = '';
      }
    }

    // Activate new tab
    this.tabs[index].setAttribute('aria-selected', 'true');
    this.tabs[index].setAttribute('tabindex', '0');
    this.tabs[index].classList.add('active');

    if (this.panels[index]) {
      this.panels[index].hidden = false;
      this.panels[index].classList.add('active');
    }

    this.activeIndex = index;

    // Announce to screen readers
    if (announce) {
      const tabText = this.tabs[index].textContent;
      announceToScreenReader(`${tabText} tab selected`);
    }

    // Emit after deactivate event
    this.emit('afterDeactivate', { 
      tab: this.tabs[previousIndex], 
      panel: this.panels[previousIndex], 
      index: previousIndex 
    });

    // Emit after activate event
    this.emit('afterActivate', { 
      tab: this.tabs[index], 
      panel: this.panels[index], 
      index 
    });
  }

  /**
   * Get active tab index
   */
  getActiveIndex() {
    return this.activeIndex;
  }

  /**
   * Get active tab element
   */
  getActiveTab() {
    return this.tabs[this.activeIndex];
  }

  /**
   * Get active panel element
   */
  getActivePanel() {
    return this.panels[this.activeIndex];
  }

  /**
   * Add a new tab
   */
  addTab(title, content, index = null) {
    const insertIndex = index !== null ? index : this.tabs.length;
    
    // Create tab
    const tab = this.createTab(title, insertIndex);
    
    // Create panel
    const panel = document.createElement('div');
    panel.className = 'tab-panel';
    
    if (typeof content === 'string') {
      panel.innerHTML = content;
    } else if (content instanceof Element) {
      panel.appendChild(content);
    }

    // Insert at specified index
    if (insertIndex === this.tabs.length) {
      this.tabList.appendChild(tab);
      this.element.appendChild(panel);
      this.tabs.push(tab);
      this.panels.push(panel);
    } else {
      this.tabList.insertBefore(tab, this.tabs[insertIndex]);
      this.element.insertBefore(panel, this.panels[insertIndex]);
      this.tabs.splice(insertIndex, 0, tab);
      this.panels.splice(insertIndex, 0, panel);
    }

    // Update indices and accessibility
    this.updateIndices();
    this.setupAccessibility();
    this.bindEvents();

    return { tab, panel };
  }

  /**
   * Remove a tab
   */
  removeTab(index) {
    if (index < 0 || index >= this.tabs.length) return;

    const tab = this.tabs[index];
    const panel = this.panels[index];

    // Remove from DOM
    tab.remove();
    panel.remove();

    // Remove from arrays
    this.tabs.splice(index, 1);
    this.panels.splice(index, 1);

    // Update indices
    this.updateIndices();

    // Adjust active index if necessary
    if (index === this.activeIndex && this.tabs.length > 0) {
      const newIndex = Math.min(this.activeIndex, this.tabs.length - 1);
      this.activateTab(newIndex);
    } else if (index < this.activeIndex) {
      this.activeIndex--;
    }
  }

  /**
   * Update tab indices after adding/removing tabs
   */
  updateIndices() {
    this.tabs.forEach((tab, index) => {
      tab.dataset.index = index;
    });
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
   * Destroy tabs component
   */
  destroy() {
    // Remove event listeners
    this.tabs.forEach(tab => {
      tab.removeEventListener('click', this.handleTabClick);
      tab.removeEventListener('keydown', this.handleTabKeydown);
      tab.removeEventListener('focus', this.handleTabFocus);
    });

    // Clear callbacks
    Object.keys(this.callbacks).forEach(key => {
      this.callbacks[key] = [];
    });
  }

  /**
   * Static method to initialize tabs from data attributes
   */
  static fromElement(element) {
    const options = {
      orientation: element.dataset.orientation || 'horizontal',
      activateOnFocus: element.dataset.activateOnFocus === 'true',
      destroyOnHide: element.dataset.destroyOnHide === 'true'
    };

    return new Tabs(element, options);
  }
}