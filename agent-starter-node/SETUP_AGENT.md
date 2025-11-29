# Agent Setup Commands

## Quick Start - Install and Run Agent

### Step 1: Install Dependencies
```bash
cd agent-starter-node
pnpm install
```

### Step 2: Download Required Model Files
```bash
pnpm run download-files
```

### Step 3: Start the Agent
```bash
# Development mode (with hot reload)
pnpm dev

# OR production mode
pnpm build
pnpm start
```

---

## Complete Setup (First Time)

```bash
# Navigate to agent directory
cd agent-starter-node

# Install all dependencies
pnpm install

# Download VAD and other model files
pnpm run download-files

# Start in development mode
pnpm dev
```

---

## Environment Variables

Make sure `agent-starter-node/.env.local` has:
```env
LIVEKIT_URL=wss://verlyai-fjmbd34k.livekit.cloud
LIVEKIT_API_KEY=APIL3GZDeGsa2Hq
LIVEKIT_API_SECRET=65qDaVl2OdXWdGKWYPCntWT0N9L3l8rzn0r8cjN9EgM
LIVEKIT_AGENT_NAME=my-voice-agent
```

---

## Available Commands

- `pnpm install` - Install dependencies
- `pnpm dev` - Start agent in development mode
- `pnpm build` - Build for production
- `pnpm start` - Start production build
- `pnpm run download-files` - Download required model files
- `pnpm test` - Run tests
- `pnpm lint` - Run linter

---

## Troubleshooting

**If models are missing:**
```bash
pnpm run download-files
```

**If dependencies are outdated:**
```bash
pnpm install
```

**Check if agent is running:**
- Look for logs showing "Agent entering" or "Session started"
- Check port conflicts if startup fails

