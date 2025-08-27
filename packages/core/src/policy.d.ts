export declare const POLICY: {
    allowDomains: any;
    blockPatterns: RegExp[];
    requireConfirm: RegExp[];
    maxSteps: number;
};
export declare function needsHumanApproval(text: string): boolean;
