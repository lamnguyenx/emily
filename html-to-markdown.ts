import TurndownService from 'turndown';

function addLatexRule(turndownService: TurndownService): void {
  turndownService.addRule('latex', {
    filter: (node) => {
      return node.nodeName === 'SPAN' &&
             node.classList.contains('math-inline') &&
             node.hasAttribute('data-math');
    },
    replacement: (content, node) => {
      const latex = node.getAttribute('data-math');
      // Use single $ for inline math
      return `$${latex}$`;
    }
  });
}

function addCodeBlockRule(turndownService: TurndownService): void {
  turndownService.addRule('codeBlock', {
    filter: (node) => {
      return node.nodeName === 'CODE-BLOCK' ||
             (node.nodeName === 'PRE' && !!node.querySelector('code'));
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

export function htmlToMarkdown(html: string): string {
  const converter = createMarkdownConverter();
  return converter.turndown(html);
}