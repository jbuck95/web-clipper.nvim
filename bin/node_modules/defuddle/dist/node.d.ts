import { Defuddle as DefuddleClass } from './defuddle';
import type { DefuddleOptions, DefuddleResponse } from './types';
/**
 * Parse HTML content from a Document, HTML string, or JSDOM instance.
 * Accepts any DOM Document implementation (linkedom, JSDOM, happy-dom, etc.).
 * @param input Document instance, HTML string, or JSDOM-like object with window.document
 * @param url URL of the page being parsed
 * @param options Optional parsing options
 * @returns Promise with parsed content and metadata
 */
export declare function Defuddle(input: Document | string | {
    window: {
        document: Document;
        location: {
            href: string;
        };
    };
}, url?: string, options?: DefuddleOptions): Promise<DefuddleResponse>;
export { DefuddleClass, DefuddleOptions, DefuddleResponse };
