import { BaseExtractor, ExtractorOptions } from './extractors/_base';
type ExtractorConstructor = new (document: Document, url: string, schemaOrgData?: any, options?: ExtractorOptions) => BaseExtractor;
interface ExtractorMapping {
    patterns: (string | RegExp)[];
    extractor: ExtractorConstructor;
}
export declare class ExtractorRegistry {
    private static mappings;
    static initialize(): void;
    static register(mapping: ExtractorMapping): void;
    static findExtractor(document: Document, url: string, schemaOrgData?: any, options?: ExtractorOptions): BaseExtractor | null;
    static findAsyncExtractor(document: Document, url: string, schemaOrgData?: any, options?: ExtractorOptions): BaseExtractor | null;
    static findPreferredAsyncExtractor(document: Document, url: string, schemaOrgData?: any, options?: ExtractorOptions): BaseExtractor | null;
    private static findByPredicate;
}
export {};
