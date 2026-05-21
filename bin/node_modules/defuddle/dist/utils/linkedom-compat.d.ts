/**
 * Parse HTML with linkedom and apply polyfills for missing DOM APIs
 * (styleSheets, getComputedStyle) that defuddle's internals expect.
 */
export declare function parseLinkedomHTML(html: string, url?: string): Document;
