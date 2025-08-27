import { BrowserDriver } from './driver';
import { ComputerAction, ComputerUseResult } from '@rpa/core';
import fs from 'fs';

export class Executor {
  constructor(private driver: BrowserDriver) {}

  async run(action: ComputerAction): Promise<ComputerUseResult> {
    switch (action.type) {
      case 'screenshot': {
        const imageBase64 = await this.driver.screenshotBase64();
        try {
          fs.writeFileSync(
            '/tmp/latest.png',
            Buffer.from(imageBase64, 'base64'),
          );
        } catch {}
        return { imageBase64 };
      }
      case 'mouse_move':
        await this.driver.clickXY(action.x, action.y);
        return {};
      case 'left_click':
        await this.driver.clickXY(action.x, action.y);
        return {};
      case 'type':
        await this.driver.typeText(action.text);
        return {};
      case 'key':
        await this.driver.press(action.combo);
        return {};
      default:
        return { text: `unknown action ${JSON.stringify(action)}` };
    }
  }
}

export { BrowserDriver };
