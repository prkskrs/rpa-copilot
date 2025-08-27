export type ComputerAction = {
    type: "screenshot";
} | {
    type: "mouse_move";
    x: number;
    y: number;
} | {
    type: "left_click";
    x: number;
    y: number;
} | {
    type: "type";
    text: string;
} | {
    type: "key";
    combo: string;
};
export type ComputerUseResult = {
    imageBase64?: string;
    text?: string;
};
export declare class OpenAIComputerUse {
    private model;
    private client;
    constructor(model?: any);
    step(input: string, latestScreenshotB64?: string): Promise<ComputerAction[] | undefined>;
}
