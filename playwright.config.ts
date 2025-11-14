{
  "projects": [
    {
      "name": "chromium",
      "use": {
        "browserName": "chromium",
        "viewport": { "width": 1280, "height": 720 },
        "launchOptions": {
          "args": ["--no-sandbox", "--disable-setuid-sandbox"]
        }
      }
    },
    {
      "name": "firefox",
      "use": {
        "browserName": "firefox",
        "viewport": { "width": 1280, "height": 720 }
      }
    },
    {
      "name": "webkit",
      "use": {
        "browserName": "webkit",
        "viewport": { "width": 1280, "height": 720 }
      }
    },
    {
      "name": "Mobile Chrome",
      "use": {
        "browserName": "chromium",
        "viewport": { "width": 375, "height": 667 },
        "isMobile": true
      }
    },
    {
      "name": "Mobile Safari",
      "use": {
        "browserName": "webkit",
        "viewport": { "width": 375, "height": 667 },
        "isMobile": true
      }
    }
  ],
  "webServer": {
    "command": "npm run dev",
    "url": "http://localhost:3002",
    "timeout": 120 * 1000,
    "reuseExistingServer": !process.env.CI
  }
}