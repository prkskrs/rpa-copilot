import 'dotenv/config';
import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { BrowserDriver, Executor } from '@rpa/driver-playwright';
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

  const driver = new BrowserDriver();
  await driver.start(startUrl);
  const executor = new Executor(driver);
  const graph = buildGraph(executor);

  const updates: any[] = [];
  let step = 0;
  let lastSavedHash: string | undefined;
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
      const hash = crypto.createHash('sha1').update(buf).digest('hex');
      if (hash !== lastSavedHash) {
        const filename = `step-${String(step).padStart(4, '0')}-${hash}.png`;
        const outPath = path.join(runDir, filename);
        try {
          fs.writeFileSync(outPath, buf);
          savedImagePath = outPath;
          lastSavedHash = hash;
        } catch {}
      }
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
  res.json({ thread_id, updates, logs_dir: runDir });
});

app.listen(7007, () => console.log('RPA agent listening on :7007'));
