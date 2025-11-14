#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';

// Define the directories to check
const directoriesToCheck = [
  './src/frontend'
];

// Function to run pa11y on HTML files
function runAccessibilityCheck() {
  console.log('Starting accessibility check...\n');
  
  directoriesToCheck.forEach(dir => {
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir).filter(file => path.extname(file) === '.html');
      
      files.forEach(file => {
        const filePath = path.join(dir, file);
        console.log(`Checking ${filePath}...`);
        
        // Run pa11y on each HTML file
        const command = `npx pa11y --config .pa11yci.json --reporter cli "${filePath}"`;
        
        exec(command, (error, stdout, stderr) => {
          if (error) {
            console.error(`Error checking ${filePath}: ${error.message}`);
            return;
          }
          
          if (stdout.trim()) {
            console.log(stdout);
          }
          
          if (stderr) {
            console.error(`stderr: ${stderr}`);
          }
        });
      });
    } else {
      console.log(`Directory ${dir} does not exist, skipping...`);
    }
  });
  
  console.log('\nAccessibility check initiated. Results will appear above as they complete.');
}

// Run the check
runAccessibilityCheck();