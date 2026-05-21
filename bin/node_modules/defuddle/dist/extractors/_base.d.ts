import { ExtractorResult } from '../types/extractors';
export interface ExtractorOptions {
    includeReplies?: boolean | 'extractors';
    language?: string;
}
export declare abstract class BaseExtractor {
    protected document: Document;
    protected url: string;
    protected schemaOrgData?: any;
    protected options: ExtractorOptions;
    constructor(document: Document, url: string, schemaOrgData?: any, options?: ExtractorOptions);
    abstract canExtract(): boolean;
    abstract extract(): ExtractorResult;
    canExtractAsync(): boolean;
    /**
     * When true, parseAsync() will prefer extractAsync() over extract(),
     * even if sync extraction produces content. Use this when the async
     * path provides strictly better results (e.g. YouTube transcripts).
     */
    prefersAsync(): boolean;
    extractAsync(): Promise<ExtractorResult>;
}
