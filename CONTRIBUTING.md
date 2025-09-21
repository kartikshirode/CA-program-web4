# Contributing to Accessible UI Components

Thank you for your interest in contributing to Accessible UI Components! This document provides guidelines and information for contributors.

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md).

## How to Contribute

### Reporting Bugs

Before creating bug reports, please check the [issue tracker](https://github.com/kartik/accessible-ui-components/issues) to see if the issue has already been reported.

When creating a bug report, include:
- A clear title and description
- Steps to reproduce the issue
- Expected vs actual behavior
- Browser and version information
- Any relevant code examples

### Suggesting Enhancements

Enhancement suggestions are welcome! Please:
- Use a clear title and description
- Explain the current behavior vs desired behavior
- Provide examples of how the enhancement would be used
- Consider accessibility implications

### Pull Requests

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add or update tests as needed
5. Ensure all tests pass (`npm test`)
6. Update documentation if necessary
7. Commit your changes (`git commit -m 'Add amazing feature'`)
8. Push to the branch (`git push origin feature/amazing-feature`)
9. Open a Pull Request

## Development Setup

### Prerequisites

- Node.js 16+ and npm
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/kartik/accessible-ui-components.git
cd accessible-ui-components

# Install dependencies
npm install

# Start development server
npm run dev
```

### Available Scripts

- `npm run dev` - Start development server with live reload
- `npm test` - Run test suite
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run build` - Build production bundle
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Coding Standards

### JavaScript

- Use ES6+ features
- Follow the existing code style
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Avoid external dependencies when possible

### CSS

- Use CSS custom properties for theming
- Follow BEM methodology for class naming
- Ensure high contrast mode compatibility
- Test with reduced motion preferences

### Accessibility

- Follow WCAG 2.1 AA guidelines
- Test with keyboard navigation
- Test with screen readers
- Ensure proper ARIA attributes
- Support high contrast mode

## Testing

### Unit Tests

All components must have comprehensive unit tests:

```javascript
describe('Component', () => {
  test('should initialize correctly', () => {
    // Test implementation
  });
});
```

### Accessibility Tests

Include accessibility-specific tests:

```javascript
test('should have correct ARIA attributes', () => {
  expect(element.getAttribute('role')).toBe('dialog');
  expect(element.getAttribute('aria-modal')).toBe('true');
});
```

### Browser Testing

Test across different browsers:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Documentation

### Code Comments

- Use JSDoc for public APIs
- Explain complex logic
- Document accessibility features

### README Updates

Update README.md when:
- Adding new features
- Changing public APIs
- Updating browser support

## Accessibility Guidelines

### WCAG Compliance

Ensure all components meet WCAG 2.1 AA standards:
- Proper color contrast ratios
- Keyboard accessibility
- Screen reader compatibility
- Focus management

### Testing Tools

Use these tools for accessibility testing:
- axe-core browser extension
- WAVE Web Accessibility Evaluator
- Screen readers (NVDA, JAWS, VoiceOver)
- Keyboard-only navigation

## Performance Considerations

- Minimize DOM manipulation
- Use efficient event delegation
- Avoid memory leaks
- Optimize for mobile devices
- Consider bundle size impact

## Release Process

1. Update version in package.json
2. Update CHANGELOG.md
3. Create a git tag
4. Push tag to trigger release workflow
5. GitHub Actions will build and publish

## Questions?

If you have questions about contributing:
- Check existing [issues](https://github.com/kartik/accessible-ui-components/issues)
- Start a [discussion](https://github.com/kartik/accessible-ui-components/discussions)
- Contact the maintainers

Thank you for contributing! 🎉