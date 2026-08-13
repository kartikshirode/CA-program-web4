# Accessible UI Components

Three UI components (Modal, Tabs, Carousel) written in plain JavaScript with accessibility as the whole point. No framework, no runtime dependencies. This was the fourth project in a web dev program I did, which is where the repo name comes from. The code itself is a small component library with tests and a build setup.

## What's inside

- **Modal**: focus trap, Escape to close, backdrop click handling, and focus goes back to the trigger element when it closes.
- **Tabs**: arrow key navigation with Home and End, horizontal or vertical orientation, and you can add or remove tabs at runtime.
- **Carousel**: touch and swipe gestures, optional autoplay that pauses on hover and focus, arrows and dot indicators, ARIA live announcements when the slide changes.

All three set proper ARIA roles and announce state changes to screen readers. The shared plumbing lives in `src/utils/`: a FocusTrap class, id generation, screen reader announcements and touch gesture handling.

## Getting started

```bash
npm install
npm run dev
```

That starts live-server on http://localhost:3000 and opens the demo page, which has working examples of every component. It's the fastest way to see what this does.

Other scripts:

```bash
npm test              # Jest suite (jsdom)
npm run test:coverage # same, with a coverage report
npm run build         # Rollup UMD bundles + concatenated CSS into dist/
npm run lint
npm run format
```

The build produces `dist/ui-components.js`, a minified `dist/ui-components.min.js` and a single `dist/ui-components.css`.

## Usage

As ES modules:

```javascript
import { Modal, Tabs, Carousel } from './src/index.js';

const modal = new Modal({ backdrop: true, keyboard: true });
modal.setTitle('Confirm')
     .setBody('<p>Are you sure?</p>')
     .setFooter('<button class="btn btn-primary">Yes</button>')
     .open();
```

Or through the UMD build, where everything hangs off `window.UIComponents`:

```html
<link rel="stylesheet" href="dist/ui-components.css">
<script src="dist/ui-components.min.js"></script>
<script>
  const modal = new UIComponents.Modal();
  modal.setTitle('Hello').open();
</script>
```

Tabs and Carousel wrap markup that's already on the page:

```javascript
const tabs = new Tabs(document.getElementById('my-tabs'), {
  orientation: 'horizontal',
  activateOnFocus: false
});
tabs.addTab('New tab', '<p>Content</p>');
tabs.on('afterActivate', (data) => console.log(data.index));

const carousel = new Carousel(document.getElementById('my-carousel'), {
  infinite: true,
  autoplay: true,
  dots: true
});
carousel.nextSlide();
```

`demo/index.html` shows the exact markup each component expects, so start there.

Every component fires lifecycle events through `.on()`. Modal has `beforeOpen`, `afterOpen`, `beforeClose` and `afterClose`; Tabs has the activate and deactivate pairs; Carousel has `beforeChange`, `afterChange`, `init` and `destroy`. All three also expose a `destroy()` method for cleanup.

## Theming

The styles run on CSS custom properties defined in `src/styles/base.css`, so you can retheme without editing component CSS:

```css
:root {
  --ui-primary: #007bff;
  --ui-border-radius: 0.375rem;
  --ui-font-family: system-ui, sans-serif;
}
```

## Tests

Jest with jsdom. There's a test file per component plus a separate accessibility suite that checks ARIA attributes, focus behavior and keyboard handling.

```bash
npm test
```

## CI and deployment

A GitHub Actions workflow lints, runs the tests on Node 16, 18 and 20, builds the bundles and runs a security audit. The repo also carries a `vercel.json`, so it deploys to Vercel as a static site with `npm run build` producing everything it serves. See DEPLOYMENT.md if you want to host it somewhere else.

## License

MIT, see [LICENSE](LICENSE).
