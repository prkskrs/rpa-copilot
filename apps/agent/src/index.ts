import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import crypto from 'crypto';
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

  const driver = new BrowserDriver();
  await driver.start(startUrl);
  const executor = new Executor(driver);
  const graph = buildGraph(executor);

  const updates: any[] = [];
  for await (const u of graph.stream(
    { goal, steps: 0 },
    { configurable: { thread_id } },
  )) {
    updates.push(u);
  }

  await driver.stop();
  res.json({ thread_id, updates });
});

app.listen(7007, () => console.log('RPA agent listening on :7007'));
