# Accessibility Testing for Genaro DFT 2.0

This document explains the implemented automated accessibility testing for the Genaro DFT 2.0 platform.

## Setup

Before running accessibility tests, you need to install the required dependencies:

```bash
npm install
```

## Running Accessibility Tests

### Quick Check
To run a quick accessibility check on all HTML files:

```bash
npm test
```

Or run pa11y directly:

```bash
npx pa11y --config .pa11yci.json dark_mockups/*.html
```

### Detailed Report
To generate a detailed HTML accessibility report:

```bash
npm run accessibility-test-detailed
```

This will create an `accessibility-report.html` file with a detailed report.

### Custom Check
To run accessibility check on a specific HTML file:

```bash
npx pa11y --config .pa11yci.json dark_mockups/index.html
```

## Configuration

The `.pa11yci.json` file contains the configuration for accessibility testing:

- **Standard**: Uses WCAG2A as the baseline
- **Runners**: Uses axe-core for testing
- **Ignored rules**: Certain warnings and notices are ignored to focus on the most critical issues
- **Timeout**: Tests have a 15-second timeout
- **Wait**: Pauses 500ms after page load to allow dynamic content to load

## ESLint Integration

We also use `eslint-plugin-jsx-a11y` to catch accessibility issues in JavaScript/JSX code. Run it with:

```bash
npx eslint dark_mockups/**/*.js --config .eslintrc.json
```

## Custom Accessibility Script

A custom script is available for more control:

```bash
node accessibility-check.js
```

## CI/CD Integration

To integrate accessibility tests into your CI/CD pipeline, add this script:

```bash
# Install dependencies
npm install

# Run accessibility tests
npm test

# Fail if there are accessibility violations
if [ $? -ne 0 ]; then
  echo "Accessibility tests failed!"
  exit 1
fi
```

## Common Issues Addressed

The automated tests look for:

- Missing alt text on images
- Insufficient color contrast
- Missing form labels
- Incorrect heading hierarchy
- Missing ARIA attributes
- Non-accessible interactive elements
- Missing language attributes
- Improper table markup
- Missing document titles

## Manual Testing

While automated tests catch many issues, manual testing is still required for:

- Testing with screen readers
- Verifying logical tab order
- Testing with keyboard only
- Checking for color-blindness accessibility
- Verifying that dynamic content is accessible