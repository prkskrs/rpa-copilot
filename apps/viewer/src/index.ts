import 'dotenv/config';
import express, { Request, Response } from 'express';
import fs from 'fs';
const app = express();

app.get('/latest.png', (_req: Request, res: Response) => {
  const p = '/tmp/latest.png';
  if (fs.existsSync(p)) res.sendFile(p);
  else res.status(404).end();
});

app.listen(7008, () => console.log('Viewer on :7008'));
