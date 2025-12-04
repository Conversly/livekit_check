## Dev Setup
```console
cd agent-starter-python
uv sync
```
lk cloud auth
lk app env -w -d .env.local
      or 
- `LIVEKIT_URL`
- `LIVEKIT_API_KEY`
- `LIVEKIT_API_SECRET`

## Run the agent

```console
uv run python src/agent.py download-files
```

Next, run this command to speak to your agent directly in your terminal:
```console
uv run python src/agent.py console
```

To run the agent for use with a frontend or telephony, use the `dev` command:
```console
uv run python src/agent.py dev
```

In production, use the `start` command:

```console
uv run python src/agent.py start
```

## frontend

```console
cd frontend-livekit
pnpm dev
```