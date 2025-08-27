import { OpenAIComputerUse } from './providers/openai';
import { ComputerAction, ComputerUseResult } from './providers/openai';

type S = {
  goal: string;
  steps: number;
  lastScreenshot?: string;
  transcript: string[];
  status: 'running' | 'need_human' | 'done' | 'error';
};

const reducerPush = (arr: string[], v: string[]) => [...arr, ...v];

export interface ActionExecutor {
  run(action: ComputerAction): Promise<ComputerUseResult>;
}

export function buildGraph(executor: ActionExecutor, driver?: any) {
  const provider = new OpenAIComputerUse();
  return {
    async *stream(initial: Pick<S, 'goal' | 'steps'>, _cfg?: any) {
      const s: S = {
        goal: initial.goal,
        steps: initial.steps ?? 0,
        transcript: [],
        status: 'running',
      };

      const maxSteps = Number(process.env.STEP_LIMIT ?? 40);
      while (s.status === 'running') {
        const domHints =
          typeof driver?.domIndex === 'function'
            ? await driver.domIndex()
            : undefined;
        const actions = await provider.step(
          s.goal,
          s.lastScreenshot,
          domHints as any,
        );
        if (!actions?.length) {
          s.status = 'done';
          s.transcript.push('Model ended.');
          yield { state: { ...s } };
          break;
        }
        if (s.steps >= maxSteps) {
          s.status = 'error';
          s.transcript.push('Step limit reached');
          yield { state: { ...s } };
          break;
        }
        // Execute action
        const first = actions[0] as ComputerAction;
        const result = await executor.run(first);
        s.steps += 1;
        if (result.imageBase64) s.lastScreenshot = result.imageBase64;

        // Always take a follow-up screenshot to capture the post-action UI
        const post = await executor.run({ type: 'screenshot' } as any);
        if (post.imageBase64) s.lastScreenshot = post.imageBase64;

        s.transcript.push(`did ${first.type}`);
        yield { state: { ...s }, action: first };
      }
    },
  };
}
