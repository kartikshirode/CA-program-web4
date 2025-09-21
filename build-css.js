import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read all CSS files from src/styles directory
const stylesDir = path.join(__dirname, 'src', 'styles');
const distDir = path.join(__dirname, 'dist');
const outputFile = path.join(distDir, 'ui-components.css');

// Ensure dist directory exists
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Read CSS files in specific order
const cssFiles = [
  'base.css',
  'modal.css',
  'tabs.css',
  'carousel.css'
];

let combinedCSS = '';

cssFiles.forEach(file => {
  const filePath = path.join(stylesDir, file);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    combinedCSS += `/* ${file} */\n${content}\n\n`;
  }
});

// Write combined CSS to output file
fs.writeFileSync(outputFile, combinedCSS);
console.log(`CSS files combined into ${outputFile}`);