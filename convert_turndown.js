const fs = require('fs');
const TurndownService = require('turndown');

const turndownService = new TurndownService();
const html = fs.readFileSync('html_sinppets/response_content.html', 'utf8');
const markdown = turndownService.turndown(html);
fs.writeFileSync('html_sinppets/response_content.turndown.js.md', markdown);