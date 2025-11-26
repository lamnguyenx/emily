# HTML to Markdown Conversion Implementation Plan

## Overview

Implement HTML to Markdown conversion functionality to parse rich Gemini response content into structured markdown format. The conversion will preserve semantic structure, LaTeX math expressions, and code blocks with syntax highlighting while maintaining readability.

## Current State Analysis

- `connect-chrome.ts` currently extracts `messageContentHTML` from Gemini responses and logs it as raw HTML
- No existing HTML parsing or markdown conversion logic in the codebase
- Gemini responses contain rich content including paragraphs, headings, bold/italic text, inline code, syntax-highlighted code blocks, KaTeX-rendered LaTeX math, and horizontal rules
- Package.json has minimal dependencies (only playwright and TypeScript dev tools)

## Desired End State

After implementation, `connect-chrome.ts` will convert Gemini HTML responses to clean markdown format that:
- Preserves semantic structure (headings, paragraphs, lists if present)
- Converts LaTeX from KaTeX `data-math` attributes to proper $...$ or $$...$$ notation
- Extracts plain text from syntax-highlighted code blocks with language labels
- Maintains readability and compatibility with markdown parsers

### Key Discoveries:
- LaTeX expressions are stored in `data-math` attributes of `<span class="math-inline">` elements
- Code blocks use `<pre><code>` with hljs classes for syntax highlighting, language shown in header span
- HTML structure is consistent but may contain additional elements not in current sample

## What We're NOT Doing

- Preserving visual styling (colors, fonts) - focusing only on semantic markdown
- Supporting all possible HTML elements - starting with known Gemini response elements
- Converting back to HTML - output is final markdown format
- Handling complex nested structures beyond current Gemini patterns

## Implementation Approach

Use turndown.js library as the foundation for HTML to Markdown conversion, extended with custom rules for Gemini-specific elements (LaTeX math and syntax-highlighted code blocks). The approach prioritizes maintainability and extensibility for future HTML element support.

## Phase 1: Setup Dependencies

### Overview
Add turndown.js library and ensure build process supports it.

### Changes Required:

#### 1. Update package.json
**File**: `package.json`
**Changes**: Add turndown dependency

```json
{
  "dependencies": {
    "playwright": "^1.56.1",
    "turndown": "^7.2.0"
  }
}
```

### Success Criteria:

#### Automated Verification:
- [ ] Dependencies install successfully: `pnpm install`
- [ ] TypeScript compilation passes: `pnpx tsc --noEmit`
- [ ] Build completes: `pnpm run build`

#### Manual Verification:
- [ ] No runtime errors when importing turndown in Node.js environment

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation from the human that the dependency setup was successful before proceeding to the next phase.

---

## Phase 2: Create Base Converter

### Overview
Implement basic HTML to Markdown converter using turndown with standard configuration.

### Changes Required:

#### 1. Create html-to-markdown.ts
**File**: `html-to-markdown.ts` (new file)
**Changes**: Create new module with basic turndown setup

```typescript
import TurndownService from 'turndown';

export function createMarkdownConverter(): TurndownService {
  const turndownService = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
    bulletListMarker: '-',
    emDelimiter: '_',
    strongDelimiter: '**'
  });

  return turndownService;
}

export function htmlToMarkdown(html: string): string {
  const converter = createMarkdownConverter();
  return converter.turndown(html);
}
```

### Success Criteria:

#### Automated Verification:
- [ ] TypeScript compilation passes: `pnpx tsc --noEmit`
- [ ] Build completes: `pnpm run build`
- [ ] Unit test for basic conversion (create simple test file)

#### Manual Verification:
- [ ] Basic HTML elements convert correctly (test with simple HTML string)

---

## Phase 3: Add LaTeX Support

### Overview
Add custom rule to extract original LaTeX from KaTeX-rendered spans.

### Changes Required:

#### 1. Update html-to-markdown.ts
**File**: `html-to-markdown.ts`
**Changes**: Add LaTeX extraction rule

```typescript
// Add after createMarkdownConverter function
function addLatexRule(turndownService: TurndownService): void {
  turndownService.addRule('latex', {
    filter: (node) => {
      return node.nodeName === 'SPAN' &&
             node.classList.contains('math-inline') &&
             node.hasAttribute('data-math');
    },
    replacement: (content, node) => {
      const latex = node.getAttribute('data-math');
      // Use single $ for inline math, $$ for display if needed
      return `$${latex}$`;
    }
  });
}

// Update createMarkdownConverter to include the rule
export function createMarkdownConverter(): TurndownService {
  const turndownService = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
    bulletListMarker: '-',
    emDelimiter: '_',
    strongDelimiter: '**'
  });

  addLatexRule(turndownService);

  return turndownService;
}
```

### Success Criteria:

#### Automated Verification:
- [ ] TypeScript compilation passes: `pnpx tsc --noEmit`
- [ ] Build completes: `pnpm run build`

#### Manual Verification:
- [ ] LaTeX spans in sample HTML convert to $...$ format
- [ ] Original LaTeX expressions are preserved correctly

---

## Phase 4: Add Code Block Support

### Overview
Add custom rule to extract plain text from syntax-highlighted code blocks and preserve language labels.

### Changes Required:

#### 1. Update html-to-markdown.ts
**File**: `html-to-markdown.ts`
**Changes**: Add code block extraction rule

```typescript
// Add after addLatexRule function
function addCodeBlockRule(turndownService: TurndownService): void {
  turndownService.addRule('codeBlock', {
    filter: (node) => {
      return node.nodeName === 'CODE-BLOCK' ||
             (node.nodeName === 'PRE' && node.querySelector('code'));
    },
    replacement: (content, node) => {
      // Extract language from header if available
      let language = '';
      const header = node.querySelector('.code-block-decoration span');
      if (header) {
        language = header.textContent?.trim() || '';
      }

      // Extract plain text from code element, removing hljs spans
      const codeElement = node.querySelector('code');
      let codeText = '';
      if (codeElement) {
        // Remove syntax highlighting spans and get plain text
        codeText = codeElement.textContent || '';
      }

      // Return fenced code block with language
      const fence = '```';
      return `\n\n${fence}${language}\n${codeText}\n${fence}\n\n`;
    }
  });
}

// Update createMarkdownConverter to include the rule
export function createMarkdownConverter(): TurndownService {
  const turndownService = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
    bulletListMarker: '-',
    emDelimiter: '_',
    strongDelimiter: '**'
  });

  addLatexRule(turndownService);
  addCodeBlockRule(turndownService);

  return turndownService;
}
```

### Success Criteria:

#### Automated Verification:
- [ ] TypeScript compilation passes: `pnpx tsc --noEmit`
- [ ] Build completes: `pnpm run build`

#### Manual Verification:
- [ ] Code blocks in sample HTML convert to ```language\ncode\n``` format
- [ ] Syntax highlighting spans are stripped, plain text preserved
- [ ] Language labels are extracted correctly

---

## Phase 5: Integrate Conversion

### Overview
Modify connect-chrome.ts to use the markdown converter instead of logging raw HTML.

### Changes Required:

#### 1. Update connect-chrome.ts
**File**: `connect-chrome.ts`
**Changes**: Import converter and use it in waitForResponse

```typescript
import { htmlToMarkdown } from './html-to-markdown';

// In waitForResponse function, replace the console.log line:
const messageContentHTML = await lastResp.locator('message-content').evaluate(el => el.outerHTML);
const markdownContent = htmlToMarkdown(messageContentHTML);
console.log(`-- messageContentMarkdown:`)
console.log(markdownContent);
```

### Success Criteria:

#### Automated Verification:
- [ ] TypeScript compilation passes: `pnpx tsc --noEmit`
- [ ] Build completes: `pnpm run build`

#### Manual Verification:
- [ ] Running the script produces markdown output instead of HTML
- [ ] Markdown format is readable and preserves content structure

---

## Phase 6: Test and Validate

### Overview
Test the complete conversion pipeline with the sample HTML and verify all features work correctly.

### Changes Required:

#### 1. Create test-html-to-markdown.ts (optional)
**File**: `test-html-to-markdown.ts` (new file)
**Changes**: Simple test script to validate conversion

```typescript
import { readFileSync } from 'fs';
import { htmlToMarkdown } from './html-to-markdown';

const html = readFileSync('html_sinppets/response_content.html', 'utf8');
const markdown = htmlToMarkdown(html);
console.log('Converted Markdown:');
console.log(markdown);
```

### Success Criteria:

#### Automated Verification:
- [ ] TypeScript compilation passes: `pnpx tsc --noEmit`
- [ ] Build completes: `pnpm run build`

#### Manual Verification:
- [ ] Sample HTML converts to clean, readable markdown
- [ ] LaTeX expressions appear as $...$
- [ ] Code blocks have proper fencing and language labels
- [ ] Headings, paragraphs, and formatting are preserved
- [ ] No HTML artifacts remain in output

## Testing Strategy

### Unit Tests:
- Test LaTeX extraction from data-math attributes
- Test code block text extraction and language detection
- Test basic HTML element conversion (p, h2, b, code, hr)

### Integration Tests:
- End-to-end conversion of complete Gemini response HTML
- Verify no information loss during conversion

### Manual Testing Steps:
1. Run the test script on sample HTML and review output
2. Test with actual Gemini responses via the connect-chrome script
3. Verify LaTeX renders correctly in markdown viewers
4. Check code block syntax highlighting works in markdown editors

## Performance Considerations

- Turndown.js is lightweight and should not impact response processing time significantly
- HTML parsing happens client-side in Node.js, no additional network requests
- Memory usage should be minimal for typical Gemini response sizes

## Migration Notes

- This is a new feature with no existing data to migrate
- Raw HTML logging can be kept temporarily for debugging if needed
- No breaking changes to existing functionality

## References

- Turndown.js documentation: https://github.com/mixmark-io/turndown
- Sample Gemini HTML: `html_sinppets/response_content.html`