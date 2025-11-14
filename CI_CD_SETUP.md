# CI/CD Pipeline & Optimization for Genaro DFT 2.0

This document describes the implemented CI/CD pipeline and optimization processes for the Genaro DFT 2.0 platform.

## CI/CD Pipeline

The project uses GitHub Actions for continuous integration and deployment. The workflow is defined in `.github/workflows/ci-cd.yml`.

### Pipeline Stages

1. **Testing Stage**:
   - Runs on multiple Node.js versions (18.x, 20.x)
   - Executes accessibility tests
   - Runs linting checks
   - Performs TypeScript compilation
   - Conducts security auditing

2. **Build & Deploy Stage**:
   - Builds the API server
   - Minifies CSS files
   - Optimizes HTML files
   - Runs security scans
   - Builds Docker image for the API
   - Runs containerized tests
   - Archives production artifacts
   - Deploys to staging environment

## Optimization Processes

### CSS Minification
The pipeline minifies CSS using `uglifycss`:
```bash
npm run build-frontend
```

### HTML Optimization
HTML files are optimized using `html-minifier-terser` to:
- Collapse whitespace
- Remove comments
- Remove optional tags
- Remove redundant attributes
- Minify inline CSS and JS

### JavaScript Optimization
JavaScript files are optimized during the build process using:
- Tree shaking to remove unused code
- Minification to reduce file size
- Compression for faster loading

## Linting & Code Quality

### ESLint Configuration
The project uses ESLint for JavaScript/TypeScript code quality with accessibility-focused rules via `eslint-plugin-jsx-a11y`.

To run linting:
```bash
npm run lint
```

For API-specific linting:
```bash
npm run lint-api
```

## Security Scanning

The CI/CD pipeline includes security scanning with:
- npm audit for dependency vulnerabilities
- retire.js for scanning for vulnerable JavaScript libraries

## Local Build Process

To run the frontend optimization locally:

```bash
npm run build-frontend
```

This script:
1. Minifies the CSS file
2. Optimizes HTML files
3. Updates HTML files to use minified CSS

## Deployment

The pipeline automatically deploys to a staging environment on successful builds to the master branch. Production deployment would require additional approval steps in a real-world scenario.