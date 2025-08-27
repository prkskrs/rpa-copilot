export declare class AnthropicComputerUse {
    private model;
    private client;
    constructor(model?: string);
    step(messages: any[], toolVersion?: string): Promise<any>;
}
