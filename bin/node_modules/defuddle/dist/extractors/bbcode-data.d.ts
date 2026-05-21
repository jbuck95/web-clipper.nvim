import { BaseExtractor } from './_base';
import { ExtractorResult } from '../types/extractors';
export declare class BbcodeDataExtractor extends BaseExtractor {
    private eventData;
    canExtract(): boolean;
    extract(): ExtractorResult;
    private getEventData;
    private getGroupName;
    private parseConfigAttr;
}
