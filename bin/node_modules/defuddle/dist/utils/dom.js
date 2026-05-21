"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transferContent = transferContent;
exports.serializeHTML = serializeHTML;
exports.decodeHTMLEntities = decodeHTMLEntities;
exports.escapeHtml = escapeHtml;
exports.getClassName = getClassName;
exports.hasResponsiveShowClass = hasResponsiveShowClass;
exports.isDangerousUrl = isDangerousUrl;
exports.isDirectTableChild = isDirectTableChild;
exports.parseHTML = parseHTML;
/**
 * Move all child nodes from source to target.
 * Clears target first, then moves each child node from source.
 */
function transferContent(source, target) {
    if ('replaceChildren' in target) {
        target.replaceChildren();
    }
    else {
        while (target.firstChild) {
            target.removeChild(target.firstChild);
        }
    }
    while (source.firstChild) {
        target.appendChild(source.firstChild);
    }
}
/**
 * Read an element's inner HTML.
 */
function serializeHTML(el) {
    return el.innerHTML;
}
/**
 * Decode HTML entities in a string (e.g. `&amp;` → `&`).
 * Uses a <textarea> element which is safe for entity decoding.
 */
function decodeHTMLEntities(doc, text) {
    const textarea = doc.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value;
}
/**
 * Escape HTML special characters in a string.
 */
function escapeHtml(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
/**
 * Safely get an element's class name as a string.
 * Handles SVG elements where className is an SVGAnimatedString.
 */
function getClassName(el) {
    return typeof el.className === 'string' ? el.className : el.getAttribute('class') || '';
}
/**
 * Check if a class string contains responsive Tailwind show utilities
 * (e.g. "sm:block", "lg:flex") indicating the element is visible at some breakpoints.
 */
const RESPONSIVE_SHOW_RE = /^(sm|md|lg|xl|2xl|min-\[|max-\[):(?:block|flex|grid|inline|table|contents)/;
function hasResponsiveShowClass(className) {
    return className.split(/\s+/).some(t => RESPONSIVE_SHOW_RE.test(t));
}
/**
 * Check if a URL uses a dangerous protocol (javascript:, data:text/html).
 * Strips whitespace and control characters before checking.
 */
function isDangerousUrl(url) {
    const normalized = url.replace(/[\s\u0000-\u001F]+/g, '').toLowerCase();
    return normalized.startsWith('javascript:') || normalized.startsWith('data:text/html');
}
/**
 * Check if an element belongs directly to an ancestor table,
 * not to an intervening nested TABLE.
 */
function isDirectTableChild(el, ancestor) {
    let parent = el.parentNode;
    while (parent && parent !== ancestor) {
        if (parent.nodeName === 'TABLE')
            return false;
        parent = parent.parentNode;
    }
    return parent === ancestor;
}
/**
 * Parse an HTML string into a DocumentFragment.
 * Uses a <template> element when available (safer: no script execution,
 * no resource loading). Falls back to a <div> for environments that
 * don't support template.content (e.g. some server-side DOM libraries).
 */
function parseHTML(doc, html) {
    if (!html)
        return doc.createDocumentFragment();
    const template = doc.createElement('template');
    template.innerHTML = html;
    if (template.content) {
        return template.content;
    }
    // Fallback for environments without template.content support
    const div = doc.createElement('div');
    div.innerHTML = html;
    const fragment = doc.createDocumentFragment();
    while (div.firstChild) {
        fragment.appendChild(div.firstChild);
    }
    return fragment;
}
//# sourceMappingURL=dom.js.map