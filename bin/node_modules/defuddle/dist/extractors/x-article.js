"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.XArticleExtractor = void 0;
const _base_1 = require("./_base");
const dom_1 = require("../utils/dom");
const SELECTORS = {
    ARTICLE_READ_VIEW: '[data-testid="twitterArticleReadView"]',
    ARTICLE_CONTAINER: '[data-testid="twitterArticleRichTextView"]',
    TITLE: '[data-testid="twitter-article-title"]',
    AUTHOR: '[itemprop="author"]',
    AUTHOR_NAME: 'meta[itemprop="name"]',
    AUTHOR_HANDLE: 'meta[itemprop="additionalName"]',
    IMAGES: '[data-testid="tweetPhoto"] img',
    DRAFT_PARAGRAPHS: '.longform-unstyled, .public-DraftStyleDefault-block',
    BOLD_SPANS: 'span[style*="font-weight: bold"]',
    DRAFT_ATTRIBUTES: '[data-offset-key]',
    EMBEDDED_TWEET: '[data-testid="simpleTweet"]',
    TWEET_TEXT: '[data-testid="tweetText"]',
    USER_NAME: '[data-testid="User-Name"]',
    CODE_BLOCK: '[data-testid="markdown-code-block"]',
    HEADER_BLOCK: '[data-testid="longform-header"]',
};
class XArticleExtractor extends _base_1.BaseExtractor {
    constructor(document, url, schemaOrgData) {
        super(document, url, schemaOrgData);
        this.articleContainer = document.querySelector(SELECTORS.ARTICLE_CONTAINER);
    }
    canExtract() {
        return !!this.articleContainer;
    }
    extract() {
        const title = this.extractTitle();
        const author = this.extractAuthor();
        const contentHtml = this.extractContent();
        const description = this.createDescription();
        return {
            content: contentHtml,
            contentHtml,
            extractedContent: {
                articleId: this.getArticleId(),
            },
            variables: {
                title,
                author,
                site: 'X (Twitter)',
                description,
            }
        };
    }
    extractTitle() {
        const titleEl = this.document.querySelector(SELECTORS.TITLE);
        return titleEl?.textContent?.trim() || 'Untitled X Article';
    }
    extractAuthor() {
        const authorContainer = this.document.querySelector(SELECTORS.AUTHOR);
        if (!authorContainer)
            return this.getAuthorFromUrl();
        const name = authorContainer.querySelector(SELECTORS.AUTHOR_NAME)?.getAttribute('content');
        const handle = authorContainer.querySelector(SELECTORS.AUTHOR_HANDLE)?.getAttribute('content');
        if (name && handle)
            return `${name} (@${handle})`;
        return name || handle || this.getAuthorFromUrl();
    }
    getAuthorFromUrl() {
        // match username before /article/ or /status/, excluding system paths like /i/
        const match = this.url.match(/\/([a-zA-Z0-9_][a-zA-Z0-9_]{0,14})\/(article|status)\/\d+/);
        return match ? `@${match[1]}` : this.getAuthorFromOgTitle();
    }
    getAuthorFromOgTitle() {
        const ogTitle = this.document.querySelector('meta[property="og:title"]')?.getAttribute('content') || '';
        // Match patterns like "(4) Heinrich on X: ..." or "Heinrich on X: ..."
        const match = ogTitle.match(/^(?:\(\d+\)\s+)?(.+?)\s+on\s+X\s*:/);
        return match ? match[1].trim() : 'Unknown';
    }
    getArticleId() {
        const match = this.url.match(/article\/(\d+)/);
        return match ? match[1] : '';
    }
    extractContent() {
        if (!this.articleContainer)
            return '';
        const clone = this.articleContainer.cloneNode(true);
        this.cleanContent(clone);
        const headerImage = this.extractHeaderImage();
        return `<article class="x-article">${headerImage}${(0, dom_1.serializeHTML)(clone)}</article>`;
    }
    extractHeaderImage() {
        const readView = this.document.querySelector(SELECTORS.ARTICLE_READ_VIEW);
        if (!readView)
            return '';
        const headerPhoto = readView.querySelector(SELECTORS.IMAGES);
        if (!headerPhoto)
            return '';
        if (this.articleContainer.contains(headerPhoto))
            return '';
        const src = headerPhoto.getAttribute('src');
        if (!src)
            return '';
        const alt = headerPhoto.getAttribute('alt')?.replace(/\s+/g, ' ').trim() || 'Image';
        return `<img src="${this.upgradeImageSrc(src)}" alt="${alt}">`;
    }
    cleanContent(container) {
        const ownerDoc = container.ownerDocument || this.document;
        // convert complex elements first (before other transformations)
        this.convertEmbeddedTweets(container, ownerDoc);
        this.convertCodeBlocks(container, ownerDoc);
        this.convertHeaders(container, ownerDoc);
        this.unwrapLinkedImages(container, ownerDoc);
        this.upgradeImageQuality(container);
        // convert bold spans BEFORE paragraphs so formatting is preserved
        this.convertBoldSpans(container, ownerDoc);
        this.convertDraftParagraphs(container, ownerDoc);
        this.removeDraftAttributes(container);
        this.repairSurrogatePairs(container);
    }
    convertEmbeddedTweets(container, ownerDoc) {
        container.querySelectorAll(SELECTORS.EMBEDDED_TWEET).forEach(tweet => {
            const blockquote = ownerDoc.createElement('blockquote');
            blockquote.className = 'embedded-tweet';
            // extract author info
            const userNameEl = tweet.querySelector(SELECTORS.USER_NAME);
            const authorLinks = userNameEl?.querySelectorAll('a');
            const fullName = authorLinks?.[0]?.textContent?.trim() || '';
            const handle = authorLinks?.[1]?.textContent?.trim() || '';
            // extract tweet text
            const tweetTextEl = tweet.querySelector(SELECTORS.TWEET_TEXT);
            const tweetText = tweetTextEl?.textContent?.trim() || '';
            // build clean blockquote content
            if (fullName || handle) {
                const cite = ownerDoc.createElement('cite');
                cite.textContent = handle ? `${fullName} ${handle}` : fullName;
                blockquote.appendChild(cite);
            }
            if (tweetText) {
                const p = ownerDoc.createElement('p');
                p.textContent = tweetText;
                blockquote.appendChild(p);
            }
            tweet.replaceWith(blockquote);
        });
    }
    convertCodeBlocks(container, ownerDoc) {
        container.querySelectorAll(SELECTORS.CODE_BLOCK).forEach(block => {
            const pre = block.querySelector('pre');
            const code = block.querySelector('code');
            if (!pre || !code)
                return;
            // extract language from class (e.g., "language-bash") or from span
            let language = '';
            const langClass = code.className.match(/language-(\w+)/);
            if (langClass) {
                language = langClass[1];
            }
            else {
                // fallback: look for language label in the block header
                const langSpan = block.querySelector('span');
                language = langSpan?.textContent?.trim() || '';
            }
            // create clean pre/code structure
            const newPre = ownerDoc.createElement('pre');
            const newCode = ownerDoc.createElement('code');
            if (language) {
                newCode.setAttribute('data-lang', language);
                newCode.className = `language-${language}`;
            }
            newCode.textContent = code.textContent || '';
            newPre.appendChild(newCode);
            // replace the entire block container
            block.replaceWith(newPre);
        });
    }
    convertHeaders(container, ownerDoc) {
        // X articles use h2/h3 elements but content may be nested in spans/divs
        container.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(header => {
            const level = header.tagName.toLowerCase();
            const text = header.textContent?.trim() || '';
            if (!text)
                return;
            const newHeader = ownerDoc.createElement(level);
            newHeader.textContent = text;
            header.replaceWith(newHeader);
        });
    }
    unwrapLinkedImages(container, ownerDoc) {
        container.querySelectorAll(SELECTORS.IMAGES).forEach(img => {
            const anchor = img.closest('a');
            if (!anchor || !container.contains(anchor))
                return;
            const src = img.getAttribute('src') || '';
            const alt = img.getAttribute('alt')?.replace(/\s+/g, ' ').trim() || 'Image';
            const cleanImg = ownerDoc.createElement('img');
            cleanImg.setAttribute('src', this.upgradeImageSrc(src));
            cleanImg.setAttribute('alt', alt);
            anchor.replaceWith(cleanImg);
        });
    }
    upgradeImageQuality(container) {
        container.querySelectorAll(SELECTORS.IMAGES).forEach(img => {
            const src = img.getAttribute('src');
            if (!src)
                return;
            img.setAttribute('src', this.upgradeImageSrc(src));
        });
    }
    upgradeImageSrc(src) {
        if (src.includes('&name=')) {
            return src.replace(/&name=\w+/, '&name=large');
        }
        else if (src.includes('?')) {
            return `${src}&name=large`;
        }
        return `${src}?name=large`;
    }
    convertDraftParagraphs(container, ownerDoc) {
        // node type constants (avoid using Node global which isn't available in all environments)
        const TEXT_NODE = 3;
        const ELEMENT_NODE = 1;
        container.querySelectorAll(SELECTORS.DRAFT_PARAGRAPHS).forEach(div => {
            const p = ownerDoc.createElement('p');
            // preserve formatting (strong, links, code) by processing children
            const processNode = (node) => {
                if (node.nodeType === TEXT_NODE) {
                    p.appendChild(ownerDoc.createTextNode(node.textContent || ''));
                }
                else if (node.nodeType === ELEMENT_NODE) {
                    const el = node;
                    const tag = el.tagName.toLowerCase();
                    if (tag === 'strong') {
                        const strong = ownerDoc.createElement('strong');
                        strong.textContent = el.textContent || '';
                        p.appendChild(strong);
                    }
                    else if (tag === 'a') {
                        const link = ownerDoc.createElement('a');
                        link.setAttribute('href', el.getAttribute('href') || '');
                        link.textContent = el.textContent || '';
                        p.appendChild(link);
                    }
                    else if (tag === 'code') {
                        const code = ownerDoc.createElement('code');
                        code.textContent = el.textContent || '';
                        p.appendChild(code);
                    }
                    else {
                        // recurse into other elements (spans, divs, etc.)
                        el.childNodes.forEach(child => processNode(child));
                    }
                }
            };
            div.childNodes.forEach(child => processNode(child));
            div.replaceWith(p);
        });
    }
    convertBoldSpans(container, ownerDoc) {
        container.querySelectorAll(SELECTORS.BOLD_SPANS).forEach(span => {
            const strong = ownerDoc.createElement('strong');
            strong.textContent = span.textContent || '';
            span.replaceWith(strong);
        });
    }
    removeDraftAttributes(container) {
        container.querySelectorAll(SELECTORS.DRAFT_ATTRIBUTES).forEach(el => {
            el.removeAttribute('data-offset-key');
        });
    }
    repairSurrogatePairs(container) {
        const SHOW_TEXT = 4;
        const ownerDoc = container.ownerDocument || this.document;
        const walker = ownerDoc.createTreeWalker(container, SHOW_TEXT);
        let prev = null;
        let node;
        while ((node = walker.nextNode())) {
            const curr = node;
            if (prev) {
                const prevText = prev.textContent || '';
                const currText = curr.textContent || '';
                if (prevText && currText) {
                    const lastCode = prevText.charCodeAt(prevText.length - 1);
                    const firstCode = currText.charCodeAt(0);
                    // high surrogate followed by low surrogate across a node boundary
                    if (lastCode >= 0xD800 && lastCode <= 0xDBFF && firstCode >= 0xDC00 && firstCode <= 0xDFFF) {
                        prev.textContent = prevText.slice(0, -1);
                        curr.textContent = prevText.slice(-1) + currText;
                    }
                }
            }
            prev = curr;
        }
    }
    createDescription() {
        const text = this.articleContainer?.textContent?.trim() || '';
        return text.slice(0, 140) + (text.length > 140 ? '...' : '');
    }
}
exports.XArticleExtractor = XArticleExtractor;
//# sourceMappingURL=x-article.js.map