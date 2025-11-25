const { chromium } = require('@playwright/test');
const http = require('http');
const readline = require('readline');

function getWebSocketUrl() {
  return new Promise((resolve, reject) => {
    http.get('http://localhost:9222/json/version', (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json.webSocketDebuggerUrl);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

(async () => {
  const wsUrl = await getWebSocketUrl();
  const browser = await chromium.connectOverCDP(wsUrl);
  const context = browser.contexts()[0];
  const pages = context.pages();
  const page = pages[0] || await context.newPage();
  await page.goto('https://gemini.google.com/app');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  // discovery-card
  for (; ;) {
    const input = await new Promise((resolve) => {
      rl.once('line', resolve);
    });
    if (input.trim() === '') break;
    await page.locator('.ql-editor').fill(input);
    const queryCount = await page.locator('.chat-history .query-content').count();
    await page.locator('.send-button').click();

    const lastResp = page.locator('response-container').last();
    while (true) {
      await new Promise(resolve => setTimeout(resolve, 500));
      if (await lastResp.count() > 0) break;
    }

    const indicator = lastResp.locator('.response-container-with-gpi.ng-star-inserted');
    while (true) {
      if (await indicator.count() > 0) {
        const hasClass = await indicator.evaluate(el => el.classList.contains('response-container-has-multiple-responses'));
        if (hasClass) break;
      }
    }
    const text = await lastResp.textContent();
    console.log(text);

    const lastResponse = page.locator('response-container').last();
    await lastResponse.locator('copy-button').click();
    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    console.log(`Clipboard: ${clipboardText}`);
  }

  rl.close();
  await browser.close();

})();