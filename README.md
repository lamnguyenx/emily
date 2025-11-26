# Emily

A Node.js script to automate interactions with Google Gemini using Playwright and Chrome DevTools Protocol (CDP).

## Prerequisites

- Node.js (v16 or later)
- pnpm (this project uses pnpm and pnpx instead of npm/npx)
- Google Chrome browser

## Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd emily
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Log in to your Google account in a regular Chrome instance and copy the user data:
   - On macOS:
     ```bash
     cp -r "$HOME/Library/Application Support/Google/Chrome" "$HOME/ChromeDebug"
     ```
   - On Linux:
     ```bash
     cp -r "$HOME/.config/google-chrome" "$HOME/ChromeDebug"
     ```
   To find your exact Chrome profile path, open Chrome and navigate to `chrome://version`. Look for "Profile Path".
   This preserves your login session for automation.

4. Start Chrome with remote debugging enabled:
   ```bash
   ./start_cdp.sh
   ```
   This opens Chrome on port 9222 for CDP connection, using the copied user data for authenticated tasks.

## Usage

### Build the project:
```bash
pnpm run build
# or
make build
```

### Run the script:
```bash
node dist/connect-chrome.js
# or
make run
```

The script will:
- Connect to the running Chrome instance
- Navigate to https://gemini.google.com/app
- Handle discovery cards
- Read input from stdin and send queries to Gemini
- Wait for responses and copy them to clipboard

Enter queries line by line. Press Enter on an empty line to exit.

## Development

- Source code: `connect-chrome.ts`
- Build output: `dist/`
- Configuration: `tsconfig.json`

To modify the script, edit `connect-chrome.ts` and rebuild.

## License

ISC