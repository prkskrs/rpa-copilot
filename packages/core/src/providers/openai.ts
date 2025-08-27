import OpenAI from 'openai';

export type ComputerAction =
  | { type: 'screenshot' }
  | { type: 'mouse_move'; x: number; y: number }
  | { type: 'left_click'; x: number; y: number }
  | { type: 'type'; text: string }
  | { type: 'key'; combo: string };

export type ComputerUseResult = {
  imageBase64?: string;
  text?: string;
};

function mapAction(a: any): ComputerAction | null {
  switch (a?.type) {
    case 'screenshot':
      return { type: 'screenshot' };
    case 'click':
      return { type: 'left_click', x: a.x, y: a.y };
    case 'move':
      return { type: 'mouse_move', x: a.x, y: a.y };
    case 'type':
      return { type: 'type', text: a.text ?? '' };
    case 'keypress':
      return { type: 'key', combo: (a.keys ?? []).join('+') };
    default:
      return null;
  }
}

export class OpenAIComputerUse {
  private client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
  private model = process.env.COMPUTER_USE_MODEL || 'computer-use-preview';

  async step(
    userGoal: string,
    latestScreenshotB64?: string,
    domHints?: Array<{
      id: string;
      role: string;
      name: string;
      x: number;
      y: number;
      bbox: [number, number, number, number];
    }>,
  ): Promise<ComputerAction[] | undefined> {
    const domText = (domHints ?? [])
      .slice(0, 60)
      .map(
        (h) =>
          `${h.id} | ${h.role} | ${h.name} | ${h.x},${h.y} | [${h.bbox.join(
            ',',
          )}]`,
      )
      .join('\n');

    const content = [
      'You control a live browser. Prefer accessible elements when possible.',
      'Available elements (id | role | name | center(x,y) | bbox[x,y,w,h]):',
      domText,
    ]
      .filter(Boolean)
      .join('\n');

    const input: any[] = [
      { role: 'user', content: `${userGoal}\n\n${content}` },
    ];

    const tools: any = [
      {
        type: 'computer_use_preview',
        display_width: 1280,
        display_height: 800,
        environment: 'browser',
      },
    ];

    try {
      const res = await this.client.responses.create({
        model: this.model,
        tools,
        input,
        truncation: 'auto',
      });

      const calls =
        (res as any).output?.filter((i: any) => i.type === 'computer_call') ||
        [];
      const actions = calls
        .map((c: any) => mapAction(c.action))
        .filter(Boolean) as ComputerAction[];
      return actions;
    } catch (e: any) {
      const msg = e?.error?.message || e?.message || '';
      if (/computer_use_preview.*not supported/i.test(msg)) {
        throw new Error(
          'Selected model does not support hosted computer-use tools. Set COMPUTER_USE_MODEL=computer-use-preview and ensure access is enabled for your org/project.',
        );
      }
      throw e;
    }
  }
}
