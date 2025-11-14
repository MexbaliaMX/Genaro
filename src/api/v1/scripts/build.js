const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const distDir = path.join(root, 'dist');
const filesToCopy = ['server.js', 'secure-server.js'];

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function copyFile(file) {
  const src = path.join(root, file);
  const dest = path.join(distDir, file);
  if (!fs.existsSync(src)) {
    throw new Error(`Source file not found: ${src}`);
  }

  ensureDir(path.dirname(dest));
  fs.copyFileSync(src, dest);
}

function build() {
  fs.rmSync(distDir, { recursive: true, force: true });
  ensureDir(distDir);

  filesToCopy.forEach(copyFile);
  console.log(`Copied ${filesToCopy.length} file(s) to dist/`);
}

build();
