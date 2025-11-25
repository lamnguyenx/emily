# Using Playwright codegen with Vivaldi remote debugging port 9222

**Session ID:** ses_54591fa47ffevg5aBTvJG7cJ8U
**Created:** 11/25/2025, 4:52:43 PM
**Updated:** 11/25/2025, 5:21:12 PM

---

## User

i've run 
/Applications/Vivaldi.app/Contents/MacOS/Vivaldi  --ignore-certificate-errors --remote-debugging-port=9222 &> ~/vivaldi.log 
ok, now can i use playwright codegen with this 

---

## Assistant

Yes, you can use Playwright codegen with your existing Vivaldi instance.

Run: `npx playwright codegen --endpoint ws://localhost:9222/devtools/browser`

---

## User

but you said

Yes, you can use Playwright codegen with your Vivaldi setup.
First, get the WebSocket URL: curl http://localhost:9222/json/version | jq -r .webSocketDebuggerUrl
Then run: playwright codegen --endpoint <ws-url> 

---

## Assistant

```
Tool: bash
```

---

## Assistant

WebSocket URL: ws://localhost:9222/devtools/browser/65a4de39-0797-4ff1-b796-a406296edde9

Run: `npx playwright codegen --endpoint ws://localhost:9222/devtools/browser/65a4de39-0797-4ff1-b796-a406296edde9`

---

## User

>>  playwright codegen --endpoint ws://localhost:9222/devtools/browser/65a4de39-0797-4ff1-b796-a406296edde9
error: unknown option '--endpoint'

---

## Assistant

```
Tool: webfetch
```

---

## Assistant

Playwright codegen does not support connecting to an existing browser instance.

As an alternative, use the Playwright library to connect and enable recording:

```javascript
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.connectOverCDP('ws://localhost:9222/devtools/browser/65a4de39-0797-4ff1-b796-a406296edde9');
  const page = await browser.newPage();
  await page.pause();  // Opens inspector for recording
})();
```

---

## User

ok, write script for me

---

## Assistant

```
Tool: glob
```

---

## Assistant

```
Tool: write
```

---

## Assistant

Run `node connect-vivaldi.js` to connect and start recording in the inspector. Ensure Playwright is installed (`npm install playwright` if needed).

---

## User

install playwright in this project with pnpm

---

## Assistant

```
Tool: bash
```

---

## Assistant

```
Tool: edit
```

---

## Assistant

```
Tool: bash
```

---

## Assistant

Playwright installed. Run `node connect-vivaldi.js` to connect and start recording.

---

## User

ok, but why i see no package.json

---

## Assistant

```
Tool: list
```

---

## Assistant

```
Tool: read
```

---

## Assistant

```
Tool: bash
```

---

## Assistant

Package.json created. Playwright is already installed.

---

## User

(base) (bash) (16:57:38.3Ns) lamnt45 @ 172.16.24.97 (native) /Users/lamnt45/git/emily ⊢ dev-lamnt45 (3d8fc0f)
>> pnpm install playwright
 WARN  7 deprecated subdependencies found: are-we-there-yet@1.1.7, boolean@3.2.0, gauge@2.7.4, har-validator@5.1.5, npmlog@4.1.2, request@2.88.2, uuid@3.4.0
Already up to date
Progress: resolved 261, reused 261, downloaded 0, added 0, done

dependencies:
+ playwright 1.56.1

Done in 1s using pnpm v10.23.0 

this install playwright global or locally?

---

## Assistant

Locally in the project. The script should work now. Run `node connect-vivaldi.js`.

---

## User

ok, but why i see no package.json in this project
how does pnpm manage per-project deps

---

## Assistant

```
Tool: list
```

---

## Assistant

```
Tool: read
```

---

## Assistant

```
Tool: bash
```

---

## Assistant

```
Tool: bash
```

---

## Assistant

```
Tool: bash
```

---

## Assistant

Pnpm manages per-project dependencies by:

- Using `package.json` to declare project dependencies and scripts.
- Storing packages in a global content-addressable store (e.g., `~/.pnpm-store`).
- Creating symlinks in the project's `node_modules` pointing to the global store for efficiency.
- Using `pnpm-lock.yaml` to lock dependency versions and ensure reproducible installs.

It seems `package.json` wasn't created. Run `pnpm init` again to generate it.

---

## User

ok, install playwright with pnpm locally for me

---

## Assistant

```
Tool: bash
```

---

## Assistant

```
Tool: write
```

---

## Assistant

```
Tool: bash
```

---

## Assistant

Playwright installed locally. Run `node connect-vivaldi.js` to connect and record.

---

## User

ok, add start_cdp.sh too to start chrome with cdp at 9222

---

## Assistant

```
Tool: write
```

---

## Assistant

```
Tool: bash
```

---

## Assistant

Script created and made executable. Run `./start_cdp.sh` to start Chrome with CDP.

---

