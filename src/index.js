/**
 * Accessible UI Components Library
 * Framework-independent, accessible UI components built with vanilla JavaScript
 */

import Modal from './components/Modal.js';
import Tabs from './components/Tabs.js';
import Carousel from './components/Carousel.js';

// Export components
export { Modal, Tabs, Carousel };

// Global object for UMD builds
if (typeof window !== 'undefined') {
  window.UIComponents = {
    Modal,
    Tabs,
    Carousel
  };
}