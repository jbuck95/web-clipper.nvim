"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseExtractor = void 0;
class BaseExtractor {
    constructor(document, url, schemaOrgData, options) {
        this.document = document;
        this.url = url;
        this.schemaOrgData = schemaOrgData;
        this.options = options || {};
    }
    canExtractAsync() {
        return false;
    }
    /**
     * When true, parseAsync() will prefer extractAsync() over extract(),
     * even if sync extraction produces content. Use this when the async
     * path provides strictly better results (e.g. YouTube transcripts).
     */
    prefersAsync() {
        return false;
    }
    async extractAsync() {
        return this.extract();
    }
}
exports.BaseExtractor = BaseExtractor;
//# sourceMappingURL=_base.js.map