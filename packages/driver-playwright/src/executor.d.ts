import { BrowserDriver } from "./driver";
import { ComputerAction, ComputerUseResult } from "@rpa/core";
export declare class Executor {
    private driver;
    constructor(driver: BrowserDriver);
    run(action: ComputerAction): Promise<ComputerUseResult>;
}
export { BrowserDriver };
