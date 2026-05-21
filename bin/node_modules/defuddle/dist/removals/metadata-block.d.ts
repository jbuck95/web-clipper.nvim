/**
 * Removes a date-containing block that is a direct sibling of the h1.
 * Complements removeHeroHeader (which targets containers wrapping h1+time together)
 * and the inline metadata-div removal in removeByContentPattern (position-based).
 * Only called when metadata extraction already confirmed the sibling is a byline
 * (metadata.published || metadata.author), to avoid removing legitimate content.
 */
export declare function removeMetadataBlock(mainContent: Element): void;
