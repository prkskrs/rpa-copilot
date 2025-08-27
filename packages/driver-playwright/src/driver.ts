import { chromium, Browser, Page } from 'playwright';

export class BrowserDriver {
  private browser!: Browser;
  private page!: Page;

  async start(url = 'about:blank') {
    this.browser = await chromium.launch({
      args: ['--no-sandbox'],
      headless: true,
    });
    const ctx = await this.browser.newContext({
      viewport: { width: 1280, height: 800 },
    });
    this.page = await ctx.newPage();
    await this.page.goto(url);
  }

  async stop() {
    await this.browser?.close();
  }

  async screenshotBase64(full = false) {
    const b = await this.page.screenshot({ fullPage: full, type: 'png' });
    return b.toString('base64');
  }

  async clickXY(x: number, y: number) {
    await this.page.mouse.move(x, y);
    await this.page.mouse.click(x, y);
  }

  async typeText(text: string) {
    await this.page.keyboard.type(text, { delay: 20 });
  }
  async press(combo: string) {
    await this.page.keyboard.press(combo);
  }

  async waitForSelector(sel: string, timeout = 15000) {
    await this.page.waitForSelector(sel, { timeout });
  }
}
