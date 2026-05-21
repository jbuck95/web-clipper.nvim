import { BaseExtractor } from './_base';
import { ExtractorResult } from '../types/extractors';
export declare class SubstackExtractor extends BaseExtractor {
    private noteText;
    private noteImage;
    private postData;
    private postContentSelector;
    constructor(document: Document, url: string, schemaOrgData?: any, options?: any);
    canExtract(): boolean;
    extract(): ExtractorResult;
    private extractPost;
    private extractNote;
    private parseDateFromByline;
    private extractPreloadData;
    private buildImageHtml;
    private getLargestSrc;
}
