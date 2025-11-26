import { readFileSync } from 'fs';
import { htmlToMarkdown } from './html-to-markdown';

const html = readFileSync('html_sinppets/response_content.html', 'utf8');
const markdown = htmlToMarkdown(html);
console.log('Converted Markdown:');
console.log(markdown);