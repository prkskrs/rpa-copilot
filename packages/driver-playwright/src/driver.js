"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrowserDriver = void 0;
const playwright_1 = require("playwright");
class BrowserDriver {
    async start(url = "about:blank") {
        this.browser = await playwright_1.chromium.launch({ args: ["--no-sandbox"], headless: true });
        const ctx = await this.browser.newContext({ viewport: { width: 1280, height: 800 } });
        this.page = await ctx.newPage();
        await this.page.goto(url);
    }
    async stop() { await this.browser?.close(); }
    async screenshotBase64(full = false) {
        const b = await this.page.screenshot({ fullPage: full, type: "png" });
        return b.toString("base64");
    }
    async clickXY(x, y) {
        await this.page.mouse.move(x, y);
        await this.page.mouse.click(x, y);
    }
    async typeText(text) { await this.page.keyboard.type(text, { delay: 20 }); }
    async press(combo) { await this.page.keyboard.press(combo); }
    async waitForSelector(sel, timeout = 15000) {
        await this.page.waitForSelector(sel, { timeout });
    }
}
exports.BrowserDriver = BrowserDriver;
//# sourceMappingURL=driver.js.map