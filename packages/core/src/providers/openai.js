"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAIComputerUse = void 0;
const openai_1 = __importDefault(require("openai"));
class OpenAIComputerUse {
    constructor(model = process.env.COMPUTER_USE_MODEL ?? "computer-use-preview") {
        this.model = model;
        this.client = new openai_1.default({ apiKey: process.env.OPENAI_API_KEY });
    }
    async step(input, latestScreenshotB64) {
        const res = await this.client.responses.create({
            model: this.model,
            input,
            tools: [{
                    type: "computer_use_preview",
                    display_width: 1280,
                    display_height: 800,
                    environment: "browser"
                }],
            truncation: "auto"
        });
        const toolCalls = res.output?.[0]?.content?.filter((c) => c.type === "tool_call");
        return toolCalls?.map((call) => call?.input);
    }
}
exports.OpenAIComputerUse = OpenAIComputerUse;
//# sourceMappingURL=openai.js.map