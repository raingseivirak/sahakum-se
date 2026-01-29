const fs = require('fs');
const path = require('path');

// Ensure the public/pdfjs directory exists
const pdfJsDir = path.join(process.cwd(), 'public', 'pdfjs');
if (!fs.existsSync(pdfJsDir)) {
  fs.mkdirSync(pdfJsDir, { recursive: true });
}

// Copy the PDF.js worker file from react-pdf's bundled pdfjs-dist
// This ensures version compatibility between react-pdf and the worker
const workerSource = path.join(
  process.cwd(),
  'node_modules',
  'react-pdf',
  'node_modules',
  'pdfjs-dist',
  'build',
  'pdf.worker.min.mjs'
);

const workerDest = path.join(pdfJsDir, 'pdf.worker.min.mjs');

if (fs.existsSync(workerSource)) {
  fs.copyFileSync(workerSource, workerDest);
  console.log('✅ PDF.js worker copied to public/pdfjs/');
} else {
  console.warn('⚠️  PDF.js worker not found - skipping copy');
}
