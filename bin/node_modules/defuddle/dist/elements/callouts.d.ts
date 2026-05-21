/**
 * Standardize callout elements from various sources.
 * Runs early in the pipeline (before selector removal) so `.alert`
 * and similar classes don't get stripped.
 */
export declare function standardizeCallouts(element: Element): void;
