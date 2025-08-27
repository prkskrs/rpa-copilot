# RPA Copilot (Computer-Use Agent)

Monorepo for a sandboxed, replayable RPA agent that uses computer-use models and Playwright.

## Local run (no Docker)

1) Create a .env file in repo root (copy from ENV.EXAMPLE)

```
OPENAI_API_KEY=sk-...
COMPUTER_USE_MODEL=computer-preview
STEP_LIMIT=40
ALLOWLIST=drive.google.com,accounts.google.com,docs.google.com
```

2) Install deps and build

```
npm install --workspaces --include-workspace-root
npm run build
```

3) Start services in two terminals

- Terminal A (viewer)
```
npm run start:viewer
```
- Terminal B (agent)
```
npm run start:agent
```

4) Trigger a run

```
curl -X POST localhost:7007/run \
  -H "content-type: application/json" \
  -d '{"goal":"Take a screenshot of the page then stop.","startUrl":"https://www.google.com"}'
```

5) Observe

- Latest screenshot: http://localhost:7008/latest.png (refresh periodically)

## Docker (optional)

See docker-compose.yml; set OPENAI_API_KEY in your shell and run `docker compose up --build`.

## Notes

- Viewer shows 404 until the first screenshot is taken.
- Guardrails: `STEP_LIMIT`, `ALLOWLIST` in env.
