"use strict";
/**
 * Standardized transcript HTML and text construction.
 *
 * Used by YouTube (and potentially other video/audio extractors)
 * to produce consistent transcript markup.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatTimestamp = formatTimestamp;
exports.buildTranscript = buildTranscript;
const dom_1 = require("./dom");
/**
 * Format seconds as a human-readable timestamp (M:SS or H:MM:SS).
 */
function formatTimestamp(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) {
        return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }
    return `${m}:${String(s).padStart(2, '0')}`;
}
/**
 * Build transcript HTML and text from segments and optional chapters.
 *
 * @param site - Site identifier for wrapper class (e.g. "youtube")
 * @param segments - Grouped transcript segments with timestamps and speaker info
 * @param chapters - Optional chapter headings with start times
 */
function buildTranscript(site, segments, chapters = []) {
    const sortedChapters = [...chapters].sort((a, b) => a.start - b.start);
    let chapterIdx = 0;
    const htmlParts = [];
    const textParts = [];
    for (const segment of segments) {
        // Insert chapter headings before this segment
        while (chapterIdx < sortedChapters.length && sortedChapters[chapterIdx].start <= segment.start) {
            const title = sortedChapters[chapterIdx].title;
            htmlParts.push(`<h3>${(0, dom_1.escapeHtml)(title)}</h3>`);
            if (textParts.length > 0)
                textParts.push('');
            textParts.push(`### ${title}`);
            textParts.push('');
            chapterIdx++;
        }
        const timestamp = formatTimestamp(segment.start);
        const speakerClass = segment.speaker !== undefined ? ` speaker-${segment.speaker}` : '';
        const tsHtml = `<strong><span class="timestamp" data-timestamp="${segment.start}">${timestamp}</span></strong>`;
        htmlParts.push(`<p class="transcript-segment${speakerClass}">${tsHtml} · ${(0, dom_1.escapeHtml)(segment.text)}</p>`);
        if (segment.speakerChange && textParts.length > 0) {
            textParts.push('');
        }
        textParts.push(`**${timestamp}** · ${segment.text}`);
    }
    return {
        html: `<div class="${site} transcript">\n<h2>Transcript</h2>\n${htmlParts.join('\n')}\n</div>`,
        text: textParts.join('\n'),
    };
}
//# sourceMappingURL=transcript.js.map