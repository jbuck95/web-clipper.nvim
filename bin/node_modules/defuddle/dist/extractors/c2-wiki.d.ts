import { BaseExtractor } from './_base';
import { ExtractorResult } from '../types/extractors';
export declare class C2WikiExtractor extends BaseExtractor {
    private pageTitle;
    canExtract(): boolean;
    canExtractAsync(): boolean;
    prefersAsync(): boolean;
    extract(): ExtractorResult;
    extractAsync(): Promise<ExtractorResult>;
    private getPageTitle;
    private renderPage;
    private markup;
    private applyBullets;
    private applyInline;
}
