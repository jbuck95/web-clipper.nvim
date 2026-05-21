"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BbcodeDataExtractor = void 0;
const _base_1 = require("./_base");
const bbcode_1 = require("../utils/bbcode");
class BbcodeDataExtractor extends _base_1.BaseExtractor {
    constructor() {
        super(...arguments);
        this.eventData = undefined;
    }
    canExtract() {
        return !!this.getEventData()?.announcement_body?.body;
    }
    extract() {
        const event = this.getEventData();
        const body = event.announcement_body;
        const contentHtml = (0, bbcode_1.bbcodeToHtml)(body.body || '');
        const title = body.headline || event.event_name || '';
        const published = body.posttime
            ? new Date(body.posttime * 1000).toISOString()
            : '';
        const author = this.getGroupName();
        return {
            content: contentHtml,
            contentHtml,
            extractedContent: {},
            variables: {
                title,
                author,
                published,
            },
        };
    }
    getEventData() {
        if (this.eventData === undefined) {
            this.eventData = this.parseConfigAttr('data-partnereventstore') ?? null;
        }
        return this.eventData;
    }
    getGroupName() {
        const data = this.parseConfigAttr('data-groupvanityinfo');
        return data?.group_name || '';
    }
    parseConfigAttr(attr) {
        const config = this.document.querySelector('#application_config');
        const raw = config?.getAttribute(attr);
        if (!raw)
            return null;
        try {
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed[0] : parsed;
        }
        catch {
            return null;
        }
    }
}
exports.BbcodeDataExtractor = BbcodeDataExtractor;
//# sourceMappingURL=bbcode-data.js.map