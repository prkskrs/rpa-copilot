import 'dotenv/config';
import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { AdvancedDriver, ExecutorAdvanced } from '@rpa/driver-playwright';
import { buildGraph } from '@rpa/core';

const app = express();
app.use(bodyParser.json());

app.post('/run', async (req: Request, res: Response) => {
  const {
    goal,
    thread_id = crypto.randomUUID(),
    startUrl = 'https://www.google.com',
  } = req.body ?? {};

  const runDir = path.resolve(process.cwd(), 'logs', thread_id);
  fs.mkdirSync(runDir, { recursive: true });
  const eventsPath = path.join(runDir, 'events.jsonl');

  const driver = new AdvancedDriver();
  await driver.start(startUrl);
  const executor = new ExecutorAdvanced(driver);
  const graph = buildGraph(executor as any, driver as any);

  const updates: any[] = [];
  const savedImages: string[] = [];
  let step = 0;
  for await (const u of graph.stream(
    { goal, steps: 0 },
    { configurable: { thread_id } },
  )) {
    step += 1;
    const action = (u as any).action;
    const state = (u as any).state;

    let savedImagePath: string | undefined;
    const b64 = state?.lastScreenshot as string | undefined;
    if (b64) {
      const buf = Buffer.from(b64, 'base64');
      const filename = `step-${String(step).padStart(4, '0')}.png`;
      const outPath = path.join(runDir, filename);
      try {
        fs.writeFileSync(outPath, buf);
        savedImagePath = outPath;
        savedImages.push(outPath);
      } catch {}
    }

    const event = {
      ts: new Date().toISOString(),
      step,
      action,
      savedImagePath,
    };
    try {
      fs.appendFileSync(eventsPath, JSON.stringify(event) + '\n');
    } catch {}

    updates.push(u);
  }

  await driver.stop();
  res.json({ thread_id, updates, logs_dir: runDir, images: savedImages });
});

app.listen(7007, () => console.log('RPA agent listening on :7007'));
