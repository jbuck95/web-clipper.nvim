import { BaseExtractor } from './_base';
import { ExtractorResult } from '../types/extractors';
export declare class GitHubExtractor extends BaseExtractor {
    private isIssue;
    private isPR;
    constructor(document: Document, url: string);
    canExtract(): boolean;
    extract(): ExtractorResult;
    private createContentHtml;
    private getIssueContent;
    private extractComments;
    private getPRBody;
    private getPRContent;
    private extractPRComments;
    private extractAuthor;
    private cleanBodyContent;
    private extractNumber;
    private extractRepoInfo;
    private createDescription;
}
