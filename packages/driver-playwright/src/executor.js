"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrowserDriver = exports.Executor = void 0;
const driver_1 = require("./driver");
Object.defineProperty(exports, "BrowserDriver", { enumerable: true, get: function () { return driver_1.BrowserDriver; } });
const fs_1 = __importDefault(require("fs"));
class Executor {
    constructor(driver) {
        this.driver = driver;
    }
    async run(action) {
        switch (action.type) {
            case "screenshot": {
                const imageBase64 = await this.driver.screenshotBase64();
                try {
                    fs_1.default.writeFileSync("/tmp/latest.png", Buffer.from(imageBase64, "base64"));
                }
                catch { }
                return { imageBase64 };
            }
            case "mouse_move":
                await this.driver.clickXY(action.x, action.y);
                return {};
            case "left_click":
                await this.driver.clickXY(action.x, action.y);
                return {};
            case "type":
                await this.driver.typeText(action.text);
                return {};
            case "key":
                await this.driver.press(action.combo);
                return {};
            default: return { text: `unknown action ${JSON.stringify(action)}` };
        }
    }
}
exports.Executor = Executor;
//# sourceMappingURL=executor.js.map