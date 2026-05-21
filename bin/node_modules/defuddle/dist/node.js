"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefuddleClass = void 0;
exports.Defuddle = Defuddle;
const defuddle_1 = require("./defuddle");
Object.defineProperty(exports, "DefuddleClass", { enumerable: true, get: function () { return defuddle_1.Defuddle; } });
const markdown_1 = require("./markdown");
/**
 * Parse HTML content from a Document, HTML string, or JSDOM instance.
 * Accepts any DOM Document implementation (linkedom, JSDOM, happy-dom, etc.).
 * @param input Document instance, HTML string, or JSDOM-like object with window.document
 * @param url URL of the page being parsed
 * @param options Optional parsing options
 * @returns Promise with parsed content and metadata
 */
async function Defuddle(input, url, options) {
    let doc;
    if (typeof input === 'string') {
        // @deprecated Pass a Document instead of an HTML string.
        // String input will be removed in the next major version.
        const { parseLinkedomHTML } = await Promise.resolve().then(() => __importStar(require('./utils/linkedom-compat')));
        doc = parseLinkedomHTML(input, url);
    }
    else if (typeof input === 'object' && input !== null && 'window' in input && input.window?.document) {
        // @deprecated Pass doc.window.document directly instead of a JSDOM instance.
        // JSDOM instance input will be removed in the next major version.
        doc = input.window.document;
        url = url || input.window.location?.href;
    }
    else {
        doc = input;
    }
    const pageUrl = url || doc.URL || 'about:blank';
    const defuddle = new defuddle_1.Defuddle(doc, {
        ...options,
        url: pageUrl
    });
    const result = await defuddle.parseAsync();
    (0, markdown_1.toMarkdown)(result, options ?? {}, pageUrl);
    return result;
}
//# sourceMappingURL=node.js.map