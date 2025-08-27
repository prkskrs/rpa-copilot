export declare class BrowserDriver {
    private browser;
    private page;
    start(url?: string): Promise<void>;
    stop(): Promise<void>;
    screenshotBase64(full?: boolean): Promise<any>;
    clickXY(x: number, y: number): Promise<void>;
    typeText(text: string): Promise<void>;
    press(combo: string): Promise<void>;
    waitForSelector(sel: string, timeout?: number): Promise<void>;
}
