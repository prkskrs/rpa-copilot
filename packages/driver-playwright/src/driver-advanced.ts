import { chromium, Browser, Page } from 'playwright';

export type DomHit = {
  id: string;
  role: string;
  name: string;
  x: number;
  y: number;
  bbox: [number, number, number, number];
};

export class AdvancedDriver {
  private browser!: Browser;
  private page!: Page;
  // Lazy-loaded OCR worker; optional dependency
  private ocr: any = null;

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
    try {
      await this.ocr?.terminate?.();
    } catch {}
    await this.browser?.close();
  }

  // A11Y-first locators
  async clickByRole(
    name: string,
    role: 'button' | 'link' | 'textbox' = 'button',
  ) {
    await this.page
      .getByRole(role as any, { name, exact: false })
      .first()
      .click();
  }

  async typeIntoRole(
    name: string,
    text: string,
    role: 'textbox' | 'combobox' = 'textbox',
  ) {
    const target = this.page
      .getByRole(role as any, { name, exact: false })
      .first();
    await target.click();
    await target.fill(text);
  }

  async typeIntoFirstTextbox(text: string) {
    const tb = this.page.getByRole('textbox' as any).first();
    await tb.click();
    await tb.fill(text);
  }

  // DOM index for model hints with retry across navigations
  async domIndex(): Promise<DomHit[]> {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        if (!this.page.isClosed()) {
          // Let DOM settle a bit between navigations
          try {
            await this.page.waitForLoadState('domcontentloaded', {
              timeout: 2000,
            });
          } catch {}
        }
        const result = await this.page.evaluate(() => {
          function accName(el: Element): string {
            const he = el as HTMLElement;
            const aria = (he as any).ariaLabel || el.getAttribute('aria-label');
            const txt = (el.textContent || '').trim();
            const nameAttr =
              el.getAttribute('name') || el.getAttribute('value') || '';
            return (aria || txt || nameAttr || '')
              .replace(/\s+/g, ' ')
              .slice(0, 140);
          }
          const clickable = Array.from(
            document.querySelectorAll(
              'button, a, [role="button"], [role="link"], [role="menuitem"], input, textarea, [contenteditable="true"]',
            ),
          );
          return clickable
            .map((el, i) => {
              const r = (el as HTMLElement).getBoundingClientRect();
              const role = el.getAttribute('role') || el.tagName.toLowerCase();
              const name = accName(el);
              return {
                id: `el_${i}`,
                role,
                name,
                x: Math.round(r.left + r.width / 2),
                y: Math.round(r.top + r.height / 2),
                bbox: [
                  Math.round(r.left),
                  Math.round(r.top),
                  Math.round(r.width),
                  Math.round(r.height),
                ] as [number, number, number, number],
              };
            })
            .filter((x) => x.name);
        });
        return result as DomHit[];
      } catch (e: any) {
        const msg = String(e?.message || e);
        if (
          /Execution context was destroyed|Target closed|Cannot find context/i.test(
            msg,
          ) &&
          attempt < 2
        ) {
          await new Promise((r) => setTimeout(r, 200));
          continue;
        }
        return [];
      }
    }
    return [];
  }

  // OCR fallback
  private async ensureOCR() {
    if (this.ocr) return;
    try {
      const { createWorker } = await import('tesseract.js');
      this.ocr = await createWorker('eng');
      await this.ocr.loadLanguage('eng');
      await this.ocr.initialize('eng');
    } catch {
      this.ocr = null;
    }
  }

  async ocrFindTextCenter(textRegex: RegExp) {
    await this.ensureOCR();
    if (!this.ocr) return null;
    const png = await this.page.screenshot({ type: 'png' });
    const { data } = await this.ocr.recognize(png);
    const match = data.words?.find((w: any) => textRegex.test(w.text));
    if (!match) return null;
    return {
      x: Math.round((match.bbox.x0 + match.bbox.x1) / 2),
      y: Math.round((match.bbox.y0 + match.bbox.y1) / 2),
    };
  }

  async mouseClickXY(x: number, y: number) {
    await this.page.mouse.click(x, y);
  }
  async key(combo: string) {
    await this.page.keyboard.press(combo);
  }
  async waitFor(sel: string, timeout = 15000) {
    await this.page.waitForSelector(sel, { timeout });
  }
  async screenshotBase64(full = false) {
    const b = await this.page.screenshot({ fullPage: full, type: 'png' });
    return b.toString('base64');
  }

  get playwrightPage() {
    return this.page;
  }
}
