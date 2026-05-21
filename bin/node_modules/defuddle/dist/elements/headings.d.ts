/**
 * Remove permalink anchors from headings and definition terms.
 * Handles symbols (#, ¶, §, 🔗), empty links, and class-based anchors.
 */
export declare function removePermalinkAnchors(element: Element): void;
export declare function isPermalinkAnchor(node: Element): boolean;
export declare const headingRules: {
    selector: string;
    element: string;
    transform: (el: Element) => Element;
}[];
