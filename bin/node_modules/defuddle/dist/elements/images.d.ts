/**
 * Standardization rules for handling images
 */
export declare const imageRules: {
    selector: string;
    element: string;
    transform: (el: Element, doc: Document) => Element;
}[];
/**
 * Check if a string is a base64 placeholder image
 */
export declare function isBase64Placeholder(src: string): boolean;
