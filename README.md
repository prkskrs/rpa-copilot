# RPA Copilot (Computer-Use Agent)

Monorepo for a sandboxed, replayable RPA agent that uses computer-use models and Playwright.

## Quick start

1. Export keys

```bash
export OPENAI_API_KEY=... # or ANTHROPIC_API_KEY
```

2. Build and run the Docker sandbox

```bash
docker compose up --build
```

3. Kick off the example task

```bash
curl -X POST localhost:7007/run \
  -H "content-type: application/json" \
  -d @<(jq -n --argjson f "$(cat tasks/invoices.yaml | yq -o=json)" '$f')
```

4. Observe screenshots

- Optional VNC: http://localhost:7900
- Lightweight viewer: http://localhost:7008/latest.png

## Dev

- Monorepo managed via npm/yarn workspaces.
- Core state machine uses LangGraph with SQLite checkpointer.
- Actions executed by Playwright driver in a headless Xvfb desktop.
