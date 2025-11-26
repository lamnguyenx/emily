import { chromium, type Page } from "@playwright/test";
import * as http from "http";
import * as readline from "readline";
import * as fs from "fs";
import { htmlToMarkdown } from "./html-to-markdown";

function getWebSocketUrl(): Promise<string> {
  return new Promise((resolve, reject) => {
    http
      .get("http://localhost:9222/json/version", (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            const json = JSON.parse(data);
            resolve(json.webSocketDebuggerUrl);
          } catch (e) {
            reject(e);
          }
        });
      })
      .on("error", reject);
  });
}

async function handleDiscoveryCard(page: Page): Promise<void> {
  try {
    await page.waitForSelector(
      'button[aria-label="Acknowledge and close the discovery card."]',
      { timeout: 10000 }
    );
    await page.click(
      'button[aria-label="Acknowledge and close the discovery card."]'
    );
  } catch (e) {
    // ignore if not found
  }
}

async function sendInput(page: Page, input: string): Promise<void> {
  await page.locator(".ql-editor").fill(input);
  const queryCount = await page.locator(".chat-history .query-content").count();
  await page.locator(".send-button").click();
}

async function waitForResponse(page: Page): Promise<void> {
  const lastResp = page.locator("response-container").last();
  while (true) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    if ((await lastResp.count()) > 0) break;
  }

  const indicator = lastResp.locator(
    ".response-container-with-gpi.ng-star-inserted"
  );
  while (true) {
    if ((await indicator.count()) > 0) {
      const hasClass = await indicator.evaluate((el) =>
        el.classList.contains("response-container-has-multiple-responses")
      );
      if (hasClass) break;
    }
  }
  const messageContentHTML = await lastResp
    .locator("message-content")
    .evaluate((el) => el.outerHTML);
  const markdownContent = htmlToMarkdown(messageContentHTML);
  console.log(`-- messageContentMarkdown:`);
  console.log(markdownContent);

  try {
    await lastResp.locator("copy-button").waitFor({ timeout: 30000 });
    await lastResp.locator("copy-button button").click();
    const clipboardText = await page.evaluate(() =>
      navigator.clipboard.readText()
    );
    console.log(`-- Clipboard: ${clipboardText}`);
  } catch (e) {
    // copy button not found, skip
  }
}

(async () => {
  const wsUrl = await getWebSocketUrl();
  const browser = await chromium.connectOverCDP(wsUrl);
  const context = browser.contexts()[0];
  const pages = context.pages();
  const page = pages[0] || (await context.newPage());
  await page.goto("https://gemini.google.com/app");

  // Check for discovery card and close it in background
  const closePromise = handleDiscoveryCard(page);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const firstInput = fs.readFileSync('connect-chrome-input.md', 'utf-8').trim();
  let isFirst = true;

  // discovery-card
  for (; ;) {
    let input: string;
    if (isFirst) {
      input = firstInput;
      isFirst = false;
      console.log('Using input from connect-chrome-input.md:', input);
    } else {
      input = await new Promise<string>((resolve) => {
        rl.once('line', resolve);
      });
      if (input.trim() === '') break;
    }
    await sendInput(page, input);
    await waitForResponse(page);
  }

  rl.close();
  await browser.close();
})();
