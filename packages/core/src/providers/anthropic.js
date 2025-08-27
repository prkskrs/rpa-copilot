"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnthropicComputerUse = void 0;
const sdk_1 = __importDefault(require("@anthropic-ai/sdk"));
class AnthropicComputerUse {
    constructor(model = "claude-4-sonnet-20250514") {
        this.model = model;
        this.client = new sdk_1.default({ apiKey: process.env.ANTHROPIC_API_KEY });
    }
    async step(messages, toolVersion = "20250124") {
        const res = await this.client.beta.messages.create({
            model: this.model,
            max_tokens: 1024,
            tools: [
                { type: `computer_${toolVersion}`, name: "computer", display_width_px: 1280, display_height_px: 800 },
                { type: `bash_${toolVersion}`, name: "bash" },
                { type: `text_editor_${toolVersion}`, name: "editor" }
            ],
            messages,
            betas: ["computer-use-2025-01-24"]
        });
        return res;
    }
}
exports.AnthropicComputerUse = AnthropicComputerUse;
//# sourceMappingURL=anthropic.js.map