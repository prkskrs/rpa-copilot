import { AdvancedDriver } from './driver-advanced';
import { ComputerAction } from '@rpa/core';

export class ExecutorAdvanced {
  constructor(private driver: AdvancedDriver) {}

  async run(action: ComputerAction) {
    switch (action.type) {
      case 'screenshot':
        return { imageBase64: await this.driver.screenshotBase64() };

      case 'type': {
        const text = (action as any)['text'] ?? '';
        if ((action as any)['targetName']) {
          try {
            await this.driver.typeIntoRole(
              (action as any)['targetName'],
              text as any,
            );
            await this.driver.key('Enter');
            return {};
          } catch {}
        }
        try {
          await this.driver.typeIntoFirstTextbox(text);
          await this.driver.key('Enter');
          return {};
        } catch {}
        // fallback: type via keyboard
        for (const ch of text) {
          await this.driver.key(ch === '\n' ? 'Enter' : ch);
        }
        await this.driver.key('Enter');
        return {};
      }

      case 'left_click': {
        const targetName = (action as any)['targetName'];
        const targetRole = (action as any)['targetRole'] ?? 'button';
        if (targetName) {
          try {
            await this.driver.clickByRole(targetName, targetRole);
            return {};
          } catch {}
        }
        if (
          typeof (action as any)['x'] === 'number' &&
          typeof (action as any)['y'] === 'number'
        ) {
          await this.driver.mouseClickXY(
            (action as any)['x'],
            (action as any)['y'],
          );
          return {};
        }
        const textRegex = (action as any)['textRegex'];
        if (textRegex) {
          const pt = await this.driver.ocrFindTextCenter(
            new RegExp(textRegex, 'i'),
          );
          if (pt) {
            await this.driver.mouseClickXY(pt.x, pt.y);
            return {};
          }
        }
        return { text: 'click failed: no resolvable target' } as any;
      }

      case 'key':
        await this.driver.key((action as any)['combo']);
        return {};

      default:
        return { text: `unknown action ${JSON.stringify(action)}` } as any;
    }
  }
}
