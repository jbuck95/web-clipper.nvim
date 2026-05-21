"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildContentHtml = buildContentHtml;
exports.buildCommentTree = buildCommentTree;
exports.buildComment = buildComment;
const dom_1 = require("./dom");
/**
 * Build the full content HTML for a post with optional comments section.
 * @param site - Site identifier for wrapper class (e.g. "reddit", "hackernews", "github")
 * @param postContent - The main post body HTML
 * @param comments - Pre-built comments HTML string (from buildCommentTree)
 */
function buildContentHtml(site, postContent, comments) {
    return `
		<div class="${site} post">
			<div class="post-content">
				${postContent}
			</div>
		</div>
		${comments ? `
			<hr>
			<div class="${site} comments">
				<h2>Comments</h2>
				${comments}
			</div>
		` : ''}
	`.trim();
}
/**
 * Build a nested comment tree from a flat list of comments with depth.
 * Uses <blockquote> elements to represent reply hierarchy.
 */
function buildCommentTree(comments) {
    const parts = [];
    const blockquoteStack = [];
    for (const comment of comments) {
        const depth = comment.depth ?? 0;
        if (depth === 0) {
            while (blockquoteStack.length > 0) {
                parts.push('</blockquote>');
                blockquoteStack.pop();
            }
            parts.push('<blockquote>');
            blockquoteStack.push(0);
        }
        else {
            const currentDepth = blockquoteStack[blockquoteStack.length - 1] ?? -1;
            if (depth < currentDepth) {
                while (blockquoteStack.length > 0 && blockquoteStack[blockquoteStack.length - 1] >= depth) {
                    parts.push('</blockquote>');
                    blockquoteStack.pop();
                }
            }
            // Open a new level if needed (handles both deeper nesting
            // and reopening after closing, e.g. depth 2 → 1 → 1)
            const newCurrentDepth = blockquoteStack[blockquoteStack.length - 1] ?? -1;
            if (depth > newCurrentDepth) {
                parts.push('<blockquote>');
                blockquoteStack.push(depth);
            }
        }
        parts.push(buildComment(comment));
    }
    while (blockquoteStack.length > 0) {
        parts.push('</blockquote>');
        blockquoteStack.pop();
    }
    return parts.join('');
}
/**
 * Build a single comment div with metadata and content.
 *
 * Metadata order: author · date · score
 * - date is wrapped in a link if url is provided
 * - score is omitted if not provided
 */
function buildComment(comment) {
    const author = `<span class="comment-author"><strong>${(0, dom_1.escapeHtml)(comment.author)}</strong></span>`;
    const safeUrl = comment.url && !(0, dom_1.isDangerousUrl)(comment.url) ? comment.url : '';
    const dateHtml = safeUrl
        ? `<a href="${(0, dom_1.escapeHtml)(safeUrl)}" class="comment-link">${(0, dom_1.escapeHtml)(comment.date)}</a>`
        : `<span class="comment-date">${(0, dom_1.escapeHtml)(comment.date)}</span>`;
    const scoreHtml = comment.score
        ? ` · <span class="comment-points">${(0, dom_1.escapeHtml)(comment.score)}</span>`
        : '';
    return `<div class="comment">
	<div class="comment-metadata">
		${author} · ${dateHtml}${scoreHtml}
	</div>
	<div class="comment-content">${comment.content}</div>
</div>`;
}
//# sourceMappingURL=comments.js.map