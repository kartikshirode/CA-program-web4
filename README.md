# Accessible UI Components

[![CI/CD](https://github.com/kartik/accessible-ui-components/workflows/CI/badge.svg)](https://github.com/kartik/accessible-ui-components/actions)
[![Coverage](https://img.shields.io/codecov/c/github/kartik/accessible-ui-components)](https://codecov.io/gh/kartik## 🚀 Deployment

### Vercel (Recommended)

This project is optimized for deployment on Vercel:

1. **Fork/Clone** this repository
2. **Connect** to Vercel dashboard
3. **Deploy** - Vercel will automatically detect the build settings
4. **Access** your deployed site at `https://your-app-name.vercel.app`

The project includes:
- `vercel.json` configuration for routing and headers
- Automated build process that generates optimized assets
- Static file serving with proper caching headers

### Manual Deployment

For other static hosting providers:

```bash
# Build the project
npm run build

# Deploy the 'dist' folder to your hosting provider
# The dist folder contains:
# - index.html (landing page)
# - demo/index.html (interactive demo)
# - ui-components.js (component library)
# - ui-components.css (styles)
```

## 🌐 Browser Compatibility

- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+
- iOS Safari 12+
- Android Chrome 60+

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.ui-components)
[![npm version](https://img.shields.io/npm/v/accessible-ui-components.svg)](https://www.npmjs.com/package/accessible-ui-components)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A collection of framework-independent, accessible UI components built with vanilla JavaScript. These components prioritize accessibility, performance, and ease of use while maintaining full compatibility with modern web standards.

## 🚀 [Live Demo](https://kartik.github.io/accessible-ui-components)

## ✨ Features

- **🔧 Framework Independent**: Pure vanilla JavaScript with no external dependencies
- **♿ Accessibility First**: WCAG 2.1 compliant with ARIA roles, keyboard navigation, and screen reader support
- **📱 Responsive Design**: Mobile-first design with touch support and responsive breakpoints
- **🎨 Customizable**: CSS custom properties for easy theming and extensive configuration options
- **🧪 Well Tested**: Comprehensive unit tests with Jest and automated CI/CD pipeline
- **⚡ Performance**: Minimal bundle size with efficient DOM manipulation

## 📦 Components

### Modal Dialog
- Focus trap and keyboard navigation
- ARIA roles and properties
- Backdrop click and ESC key closing
- Customizable content and styling
- Event-driven architecture

### Tabbed Content
- Horizontal and vertical orientations
- Arrow key navigation
- Dynamic tab management
- Screen reader compatibility
- Flexible activation behavior

### Carousel/Slider
- Touch and swipe gesture support
- Autoplay with pause on hover/focus
- Infinite loop and fade transitions
- Keyboard navigation
- ARIA live regions for announcements

## 🚀 Quick Start

### Installation

```bash
npm install accessible-ui-components
```

### CDN

```html
<!-- CSS -->
<link rel="stylesheet" href="https://unpkg.com/accessible-ui-components/dist/ui-components.css">

<!-- JavaScript -->
<script src="https://unpkg.com/accessible-ui-components/dist/ui-components.min.js"></script>
```

### ES Modules

```javascript
import { Modal, Tabs, Carousel } from 'accessible-ui-components';

// Create a modal
const modal = new Modal({
  backdrop: true,
  keyboard: true,
  focus: true
});

modal.setTitle('Example Modal')
     .setBody('<p>Modal content goes here</p>')
     .setFooter('<button class="btn btn-primary">Save</button>')
     .open();
```

### UMD (Browser)

```html
<script>
  // Components are available on window.UIComponents
  const modal = new UIComponents.Modal();
  modal.setTitle('Hello World').open();
</script>
```

## 📖 Usage Examples

### Modal Dialog

```javascript
// Basic modal
const modal = new Modal();
modal.setTitle('Confirmation')
     .setBody('Are you sure you want to delete this item?')
     .setFooter(`
       <button type="button" class="btn btn-secondary" onclick="modal.close()">Cancel</button>
       <button type="button" class="btn btn-danger" onclick="deleteItem()">Delete</button>
     `)
     .open();

// Modal with custom options
const customModal = new Modal({
  backdrop: false,
  keyboard: false,
  closeButton: false
});

// Event handling
modal.on('afterOpen', () => console.log('Modal opened'))
     .on('afterClose', () => console.log('Modal closed'));
```

### Tabs

```javascript
// Initialize tabs
const tabs = new Tabs(document.getElementById('my-tabs'), {
  orientation: 'horizontal',
  activateOnFocus: false
});

// Add new tab
tabs.addTab('New Tab', '<p>Tab content</p>');

// Remove tab
tabs.removeTab(1);

// Listen for changes
tabs.on('afterActivate', (data) => {
  console.log('Active tab:', data.index);
});
```

### Carousel

```javascript
// Basic carousel
const carousel = new Carousel(document.getElementById('my-carousel'), {
  infinite: true,
  autoplay: true,
  autoplaySpeed: 3000,
  arrows: true,
  dots: true
});

// Navigation
carousel.nextSlide();
carousel.prevSlide();
carousel.goToSlide(2);

// Event handling
carousel.on('beforeChange', (data) => {
  console.log('Changing from slide', data.currentSlide, 'to', data.nextSlide);
});
```

## 🎨 Customization

### CSS Custom Properties

All components use CSS custom properties for easy theming:

```css
:root {
  --ui-primary: #007bff;
  --ui-primary-hover: #0056b3;
  --ui-border-radius: 0.375rem;
  --ui-font-family: system-ui, sans-serif;
  --ui-spacer: 1rem;
}
```

### Component Options

Each component accepts a comprehensive options object:

```javascript
// Modal options
const modal = new Modal({
  backdrop: true,          // Show backdrop
  backdropClose: true,     // Close on backdrop click
  keyboard: true,          // Close on Escape key
  focus: true,             // Auto focus first element
  restoreFocus: true,      // Restore focus to trigger
  closeButton: true        // Show close button
});

// Tabs options
const tabs = new Tabs(element, {
  orientation: 'horizontal',  // 'horizontal' or 'vertical'
  activateOnFocus: false,     // Activate on focus vs click
  destroyOnHide: false        // Destroy content when hidden
});

// Carousel options
const carousel = new Carousel(element, {
  slidesToShow: 1,       // Slides visible at once
  slidesToScroll: 1,     // Slides to scroll
  infinite: true,        // Infinite loop
  autoplay: false,       // Auto-play slides
  autoplaySpeed: 3000,   // Auto-play speed (ms)
  arrows: true,          // Show arrows
  dots: true,            // Show dot indicators
  swipe: true,           // Enable touch/swipe
  vertical: false        // Vertical carousel
});
```

## ♿ Accessibility Features

### Keyboard Navigation
- **Modal**: Tab/Shift+Tab for focus navigation, Escape to close
- **Tabs**: Arrow keys for navigation, Home/End for first/last tab
- **Carousel**: Arrow keys for navigation, Home/End for first/last slide

### Screen Reader Support
- Proper ARIA roles and properties
- Live regions for dynamic content announcements
- Descriptive labels and help text
- Focus management and restoration

### Standards Compliance
- WCAG 2.1 AA compliant
- Section 508 compatible
- WAI-ARIA best practices
- High contrast mode support

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## 🔧 Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Lint code
npm run lint

# Format code
npm run format
```

## 📁 Project Structure

```
accessible-ui-components/
├── src/
│   ├── components/
│   │   ├── Modal.js
│   │   ├── Tabs.js
│   │   └── Carousel.js
│   ├── styles/
│   │   ├── base.css
│   │   ├── modal.css
│   │   ├── tabs.css
│   │   └── carousel.css
│   ├── utils/
│   │   ├── accessibility.js
│   │   └── touch.js
│   └── index.js
├── tests/
│   ├── Modal.test.js
│   ├── Tabs.test.js
│   ├── Carousel.test.js
│   └── setup.js
├── demo/
│   └── index.html
├── dist/
└── docs/
```

## 🌐 Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+
- iOS Safari 12+
- Android Chrome 60+

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 📧 Support

- 📖 [Documentation](https://kartik.github.io/accessible-ui-components)
- 🐛 [Issue Tracker](https://github.com/kartik/accessible-ui-components/issues)
- 💬 [Discussions](https://github.com/kartik/accessible-ui-components/discussions)

## 🙏 Acknowledgments

- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/) for accessibility guidelines
- [WCAG 2.1](https://www.w3.org/WAI/WCAG21/quickref/) for accessibility standards
- Community feedback and contributions

---

Made with ❤️ and accessibility in mind.