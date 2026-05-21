"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseLinkedomHTML = parseLinkedomHTML;
const linkedom_1 = require("linkedom");
/**
 * Parse HTML with linkedom and apply polyfills for missing DOM APIs
 * (styleSheets, getComputedStyle) that defuddle's internals expect.
 */
function parseLinkedomHTML(html, url) {
    const { document } = (0, linkedom_1.parseHTML)(html);
    const doc = document;
    if (!doc.styleSheets)
        doc.styleSheets = [];
    if (doc.defaultView && !doc.defaultView.getComputedStyle) {
        doc.defaultView.getComputedStyle = () => ({ display: '' });
    }
    // document.URL is read-only per spec, but linkedom allows mutation.
    // This sets the base URL for relative URL resolution and extractor matching.
    if (url)
        doc.URL = url;
    return document;
}
//# sourceMappingURL=linkedom-compat.js.map