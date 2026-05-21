#!/usr/bin/env node
// web-clipper content extraction pipeline.
// This script takes a URL, fetches & cleans the page, and writes Markdown
// with YAML frontmatter to stdout.  Edit this file to change how content
// is extracted, filtered, or formatted.  Test with:
//   node bin/defuddle-clip.mjs https://example.com
import { Defuddle } from 'defuddle/node';
import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';
import { JSDOM } from 'jsdom';

const url = process.argv[2];
if (!url) { console.error("Usage: defuddle-clip.mjs <url>"); process.exit(1); }

const res = await fetch(url);
const html = await res.text();

const makeAbsolute = (link) => {
  try {
    return new URL(link, url).href;
  } catch (e) {
    return link;
  }
};

const result = await Defuddle(html, url);
let content = result.content;

if (!content.includes('<img')) {
  const dom = new JSDOM(html);
  const mainImg = dom.window.document.querySelector('img[src*="image/"], img[src*="iss_moon"]');
  if (mainImg) {
    const imgSrc = makeAbsolute(mainImg.getAttribute('src'));
    const imgAlt = mainImg.getAttribute('alt') || 'APOD Image';
    content = `<p><img src="${imgSrc}" alt="${imgAlt}"></p>\n` + content;
  }
}

const dom2 = new JSDOM(content);
const doc = dom2.window.document;
doc.querySelectorAll('table').forEach(table => {
  const p = doc.createElement('p');
  table.querySelectorAll('tr').forEach(row => {
    row.querySelectorAll('td, th').forEach(cell => {
      const imgs = [...cell.querySelectorAll('img')];
      const onlyIcon = imgs.length > 0 && cell.textContent.trim() === '';
      if (onlyIcon) return;
      imgs.forEach(img => {
        const src = img.getAttribute('src') || '';
        const alt = img.getAttribute('alt') || '';
        if (src.includes('icon') || alt.toLowerCase().includes('icon')) img.remove();
      });
      [...cell.childNodes].forEach(n => p.appendChild(n.cloneNode(true)));
      p.appendChild(doc.createTextNode(' '));
    });
  });
  table.replaceWith(p);
});
content = doc.body.innerHTML;

const td = new TurndownService({ headingStyle: 'atx', bulletListMarker: '-', codeBlockStyle: 'fenced' });
td.use(gfm);
const refs = [];

td.addRule('fixImages', {
  filter: 'img',
  replacement: (content, node) => {
    let src = node.getAttribute('src') || '';
    const alt = node.getAttribute('alt') || '';
    if (!src) return '';
    if (src.includes('icon') || alt.toLowerCase().includes('icon')) return '';
    src = makeAbsolute(src);
    return `\n![${alt}](${src})\n`;
  }
});

td.addRule('footnoteLinks', {
  filter: 'a',
  replacement: (content, node) => {
    if (node.querySelector('img') || content.includes('![')) return content;
    let href = node.getAttribute('href') || '';
    if (!href || href.startsWith('#')) return content;
    href = makeAbsolute(href);
    if (href.startsWith('http')) {
      const i = refs.length + 1;
      let linkName = href;
      try {
        const parsed = new URL(href);
        linkName = parsed.pathname.split('/').filter(Boolean).pop() || parsed.hostname;
      } catch (e) {
        linkName = href.split('/').filter(Boolean).pop();
      }
      refs.push(`[^${i}]: [${linkName}](${href})`);
      return `${content}[^${i}]`;
    }
    return content;
  }
});

td.addRule('githubCode', {
  filter: node => (node.className || '').includes('highlight'),
  replacement: (c, node) => `\n\`\`\`\n${node.textContent.trim()}\n\`\`\`\n`
});

td.addRule('callouts', {
  filter: node => /^callout-/.test(node.className || ''),
  replacement: (content, node) => `\n> [!${node.className.replace('callout-', '')}]\n${content.trim().split('\n').map(l => '> ' + l).join('\n')}\n`
});

const rawMarkdown = td.turndown(content);

const parts = rawMarkdown.split(/(```[\s\S]*?```)/g);
let markdown = parts.map((part, i) => {
  if (i % 2 === 1) return part;
  return part.replace(/([^\n])\n(?!\n)(?![ \t]*([-*+]|\d+\.|>|#|\[\^|\|))/g, '$1 ');
}).join('');

const footnotes = refs.length ? '\n\n---\n\n### References\n' + refs.join('\n') : '';
const now = new Date().toISOString().split('T')[0];

const frontmatter = `---
id: "${now} ${(result.title || 'clipping').replace(/"/g, "'")}"
title: "${(result.title || 'Astronomy Picture of the Day').replace(/"/g, "'")}"
url: "${url}"
author: "${result.author || ''}"
created: "${now}"
tags:
  - clipped
aliases: []
---

`;

markdown = markdown.replace(/\\\[/g, '[').replace(/\\\]/g, ']');

process.stdout.write(frontmatter + markdown + footnotes);
