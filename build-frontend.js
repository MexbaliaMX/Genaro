#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Starting frontend build and optimization...');

const frontendDir = path.join(__dirname, 'src', 'frontend');

const getSourceHtmlFiles = () =>
  fs.readdirSync(frontendDir).filter(file => file.endsWith('.html') && !file.endsWith('.min.html'));

const cleanLegacyArtifacts = () => {
  const legacyFiles = fs.readdirSync(frontendDir).filter(file => file.endsWith('.min.min.html'));
  legacyFiles.forEach(file => {
    fs.unlinkSync(path.join(frontendDir, file));
    console.log(`✓ Removed legacy artifact ${file}`);
  });
};

const copyHtmlWithoutMinifier = () => {
  const htmlFiles = getSourceHtmlFiles();
  htmlFiles.forEach(file => {
    const filePath = path.join(frontendDir, file);
    const outputFilePath = path.join(frontendDir, file.replace('.html', '.min.html'));
    fs.copyFileSync(filePath, outputFilePath);
    console.log(`✓ Copied ${file} → ${path.basename(outputFilePath)}`);
  });
};

const copyCssWithoutMinifier = () => {
  const cssPath = path.join(frontendDir, 'style.css');
  const minCSSPath = path.join(frontendDir, 'style.min.css');
  if (fs.existsSync(cssPath)) {
    fs.copyFileSync(cssPath, minCSSPath);
    console.log('✓ Copied style.css → style.min.css');
  }
};

// Function to minify CSS
function minifyCSS() {
  console.log('Minifying CSS...');

  try {
    // Check if uglifycss is available
    execSync('npx uglifycss --help', { stdio: 'pipe', timeout: 5000 });

    const cssPath = path.join(frontendDir, 'style.css');
    const minCSSPath = path.join(frontendDir, 'style.min.css');

    if (fs.existsSync(cssPath)) {
      const result = execSync(`npx uglifycss ${cssPath}`);
      fs.writeFileSync(minCSSPath, result);
      console.log('✓ CSS minified successfully');
    } else {
      console.log('⚠ style.css not found, skipping CSS minification');
    }
  } catch (error) {
    console.log('⚠ uglifycss not available, skipping CSS minification');
    console.log('To install: npm install -g uglifycss');
    copyCssWithoutMinifier();
  }
}

// Function to optimize HTML files
function optimizeHTML() {
  console.log('Optimizing HTML files...');

  try {
    // Check if html-minifier-terser is available
    execSync('npx html-minifier-terser --help', { stdio: 'pipe', timeout: 5000 });

    const htmlFiles = getSourceHtmlFiles();

    for (const file of htmlFiles) {
      const filePath = path.join(frontendDir, file);
      const outputFilePath = path.join(frontendDir, file.replace('.html', '.min.html'));

      const command = `npx html-minifier-terser --collapse-whitespace --remove-comments --remove-optional-tags --remove-redundant-attributes --remove-script-type-attributes --remove-tag-whitespace --use-short-doctype --minify-css --minify-js "${filePath}" -o "${outputFilePath}"`;

      execSync(command);
      console.log(`✓ Optimized ${file}`);
    }
  } catch (error) {
    console.log('⚠ html-minifier-terser not available, skipping HTML optimization');
    console.log('To install: npm install -g html-minifier-terser');
    copyHtmlWithoutMinifier();
  }
}

// Function to update HTML files to use minified CSS
function updateHTMLToUseMinifiedCSS() {
  console.log('Updating HTML files to use minified CSS...');

  const htmlFiles = getSourceHtmlFiles();
  const hasMinifiedCSS = fs.existsSync(path.join(frontendDir, 'style.min.css'));

  if (!hasMinifiedCSS) {
    console.log('⚠ style.min.css not found, skipping CSS link updates');
    return;
  }

  for (const file of htmlFiles) {
    const filePath = path.join(frontendDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Replace CSS link to use minified version
    content = content.replace(/href="style\.css"/g, 'href="style.min.css"');

    fs.writeFileSync(filePath, content);
    console.log(`✓ Updated ${file} to use minified CSS`);
  }
}

// Run all optimization steps
cleanLegacyArtifacts();
minifyCSS();
optimizeHTML();
updateHTMLToUseMinifiedCSS();

console.log('\nFrontend build and optimization completed!');
