/**
 * Converts Steam/forum-style BBCode to HTML.
 * Core tags are standard across phpBB, vBulletin, MyBB, SMF, XenForo, and Steam.
 * Steam-specific tags (e.g. [previewyoutube]) are included.
 */
export declare function bbcodeToHtml(bbcode: string): string;
