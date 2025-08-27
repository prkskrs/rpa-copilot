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

export function buildGraph(executor: ActionExecutor) {
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
        const actions = await provider.step(s.goal, s.lastScreenshot);
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
        const first = actions[0] as ComputerAction;
        const result = await executor.run(first);
        s.steps += 1;
        if (result.imageBase64) s.lastScreenshot = result.imageBase64;
        s.transcript.push(`did ${first.type}`);
        yield { state: { ...s }, action: first };
      }
    },
  };
}
