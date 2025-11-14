/**
 * Performance testing script for Genaro DFT 2.0 platform
 * Tests various performance metrics across different browsers
 */

import { chromium, firefox, webkit, Page, Browser, BrowserContext } from 'playwright';
import { performance } from 'perf_hooks';
import * as fs from 'fs';

interface PerformanceMetrics {
  loadTime: number;
  domContentLoaded: number;
  firstPaint: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  timeToInteractive: number;
  bundleSize: number;
}

const testUrls = [
  'http://localhost:3002',
  'http://localhost:3002/dashboard',
  'http://localhost:3002/narrative-tracker',
  'http://localhost:3002/risk-integrity',
  'http://localhost:3002/sandbox-studio',
  'http://localhost:3002/executive-briefing',
  'http://localhost:3002/advertising-dashboard'
];

const browsers = [
  { name: 'chromium', browser: chromium },
  { name: 'firefox', browser: firefox },
  { name: 'webkit', browser: webkit }
];

async function measurePageLoad(page: Page, url: string): Promise<PerformanceMetrics> {
  const start = performance.now();
  
  await page.goto(url, { waitUntil: 'networkidle' });
  
  const navigationStart = performance.now();
  
  // Wait for page to be fully loaded
  await page.waitForLoadState('domcontentloaded');
  
  const domContentLoaded = performance.now() - navigationStart;
  
  // Measure various performance metrics
  const metrics = await page.evaluate(() => {
    const perfData = window.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const paintEntries = window.performance.getEntriesByType('paint');
    
    const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
    const firstContentfulPaint = paintEntries.find(entry => entry.name === 'first-contentful-paint');
    
    // For CLS and FID, we would need to instrument the page
    // This is a simplified version
    return {
      loadTime: perfData?.loadEventEnd - perfData?.navigationStart,
      domContentLoaded: perfData?.domContentLoadedEventEnd - perfData?.navigationStart,
      firstPaint: firstPaint?.startTime,
      firstContentfulPaint: firstContentfulPaint?.startTime,
    };
  });
  
  return {
    loadTime: metrics.loadTime,
    domContentLoaded: metrics.domContentLoaded,
    firstPaint: metrics.firstPaint,
    firstContentfulPaint: metrics.firstContentfulPaint,
    largestContentfulPaint: 0, // Would need specific measurement
    cumulativeLayoutShift: 0, // Would need specific measurement
    firstInputDelay: 0, // Would need specific measurement
    timeToInteractive: 0, // Would need specific measurement
    bundleSize: 0 // Would need specific measurement
  };
}

async function runPerformanceTests() {
  console.log('Starting performance tests...');
  
  const results: any = {};
  
  for (const { name, browser: browserType } of browsers) {
    console.log(`\nTesting on ${name}...`);
    results[name] = {};
    
    const browser: Browser = await browserType.launch();
    
    for (const url of testUrls) {
      console.log(`  Testing ${url}...`);
      
      const context: BrowserContext = await browser.newContext();
      const page: Page = await context.newPage();
      
      try {
        const metrics = await measurePageLoad(page, url);
        results[name][url] = metrics;
        
        console.log(`    Load Time: ${metrics.loadTime.toFixed(2)}ms`);
        console.log(`    DOM Content Loaded: ${metrics.domContentLoaded.toFixed(2)}ms`);
      } catch (error) {
        console.error(`    Error testing ${url}:`, error);
        results[name][url] = { error: (error as Error).message };
      } finally {
        await context.close();
      }
    }
    
    await browser.close();
  }
  
  // Save results to file
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const resultsFile = `performance-results-${timestamp}.json`;
  fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2));
  
  console.log(`\nPerformance tests completed. Results saved to ${resultsFile}`);
  
  // Generate summary
  console.log('\nPerformance Summary:');
  for (const [browserName, browserResults] of Object.entries(results)) {
    console.log(`\n${browserName.toUpperCase()}:`);
    
    let avgLoadTime = 0;
    let count = 0;
    
    for (const [url, metrics] of Object.entries(browserResults as any)) {
      if (metrics.error) {
        console.log(`  ${url}: ERROR - ${metrics.error}`);
      } else {
        console.log(`  ${url}: ${metrics.loadTime.toFixed(2)}ms`);
        avgLoadTime += metrics.loadTime;
        count++;
      }
    }
    
    if (count > 0) {
      console.log(`  Average Load Time: ${(avgLoadTime / count).toFixed(2)}ms`);
    }
  }
}

// Run the tests
runPerformanceTests().catch(console.error);