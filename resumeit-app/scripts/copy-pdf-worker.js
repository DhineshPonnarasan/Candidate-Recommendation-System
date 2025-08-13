// Copy pdf.worker.mjs from pdfjs-dist into public/ for same-origin loading
const fs = require('fs');
const path = require('path');

function resolveWorker() {
  try {
    const pkgPath = path.dirname(require.resolve('pdfjs-dist/package.json'));
    const workerPath = path.join(pkgPath, 'build', 'pdf.worker.mjs');
    if (fs.existsSync(workerPath)) return workerPath;
  } catch {}
  // Fallback older/newer structure
  try {
    const pkgPath = path.dirname(require.resolve('pdfjs-dist/package.json'));
    const alt = path.join(pkgPath, 'legacy', 'build', 'pdf.worker.js');
    if (fs.existsSync(alt)) return alt;
  } catch {}
  return null;
}

function main() {
  const src = resolveWorker();
  if (!src) {
    console.warn('[copy-pdf-worker] Could not locate pdf.worker file in pdfjs-dist');
    return;
  }
  const destDir = path.join(process.cwd(), 'public');
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
  const dest = path.join(destDir, 'pdf.worker.mjs');
  fs.copyFileSync(src, dest);
  console.log(`[copy-pdf-worker] Copied ${src} -> ${dest}`);
}

main();
