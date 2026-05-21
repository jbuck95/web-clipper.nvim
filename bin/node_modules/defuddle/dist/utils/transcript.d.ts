/**
 * Standardized transcript HTML and text construction.
 *
 * Used by YouTube (and potentially other video/audio extractors)
 * to produce consistent transcript markup.
 */
export interface TranscriptSegment {
    /** Start time in seconds */
    start: number;
    /** Segment text (plain, not HTML-escaped) */
    text: string;
    /** Whether this segment starts a new speaker turn */
    speakerChange: boolean;
    /** Speaker index (0, 1, ...) for CSS classes */
    speaker?: number;
}
export interface TranscriptChapter {
    title: string;
    /** Start time in seconds */
    start: number;
}
export interface TranscriptResult {
    html: string;
    text: string;
}
/**
 * Format seconds as a human-readable timestamp (M:SS or H:MM:SS).
 */
export declare function formatTimestamp(seconds: number): string;
/**
 * Build transcript HTML and text from segments and optional chapters.
 *
 * @param site - Site identifier for wrapper class (e.g. "youtube")
 * @param segments - Grouped transcript segments with timestamps and speaker info
 * @param chapters - Optional chapter headings with start times
 */
export declare function buildTranscript(site: string, segments: TranscriptSegment[], chapters?: TranscriptChapter[]): TranscriptResult;
