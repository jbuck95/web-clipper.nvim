/**
 * Standardized comment HTML construction.
 *
 * Used by Reddit, Hacker News, GitHub, and other extractors to produce
 * consistent comment markup.
 *
 * Metadata format (in markdown): **author** · date · score
 * - date is linked if a url is provided
 * - score is omitted if not provided
 */
export interface CommentData {
    /** Comment author name */
    author: string;
    /** Display date (e.g. "2025-01-15") */
    date: string;
    /** Comment body HTML */
    content: string;
    /** Nesting depth (0 = top-level). Omit for flat lists. */
    depth?: number;
    /** Score text (e.g. "42 points", "25 points") */
    score?: string;
    /** Permalink URL for the comment */
    url?: string;
}
/**
 * Build the full content HTML for a post with optional comments section.
 * @param site - Site identifier for wrapper class (e.g. "reddit", "hackernews", "github")
 * @param postContent - The main post body HTML
 * @param comments - Pre-built comments HTML string (from buildCommentTree)
 */
export declare function buildContentHtml(site: string, postContent: string, comments: string): string;
/**
 * Build a nested comment tree from a flat list of comments with depth.
 * Uses <blockquote> elements to represent reply hierarchy.
 */
export declare function buildCommentTree(comments: CommentData[]): string;
/**
 * Build a single comment div with metadata and content.
 *
 * Metadata order: author · date · score
 * - date is wrapped in a link if url is provided
 * - score is omitted if not provided
 */
export declare function buildComment(comment: CommentData): string;
