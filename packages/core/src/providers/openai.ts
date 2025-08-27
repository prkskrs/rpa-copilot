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

export class OpenAIComputerUse {
  private client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
  constructor(
    private model = process.env.COMPUTER_USE_MODEL ?? 'computer-preview',
  ) {}

  async step(input: string, latestScreenshotB64?: string) {
    const res = await this.client.responses.create({
      model: this.model,
      input,
      tools: [
        {
          type: 'computer-preview',
          display_width: 1280,
          display_height: 800,
          environment: 'browser',
        },
      ],
      truncation: 'auto',
    });

    const toolCalls = (res as any).output
      ?.flatMap((o: any) => o?.content || [])
      ?.filter((c: any) => c.type === 'tool_call');
    return toolCalls?.map((call: any) => call?.input) as
      | ComputerAction[]
      | undefined;
  }
}
