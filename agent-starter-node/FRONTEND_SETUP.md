# Frontend Setup Guide

This guide will help you connect a frontend to your LiveKit agent.

## Prerequisites

1. ✅ Dependencies installed (`pnpm install`)

## Quick Start (2 Terminals Only!)

### Terminal 1: Backend (Agent + Token Server Combined)

```bash
pnpm run server
```

This starts:
- ✅ Token server on `http://localhost:3001`
- ✅ LiveKit agent (automatically connects to LiveKit Cloud)

You should see:
```
🚀 Token server running on http://localhost:3001
📝 POST /token with { roomName, participantName }
🤖 Starting LiveKit agent...
```

### Terminal 2: Frontend

```bash
pnpm run frontend
```

Then open: **http://localhost:8080**

Or use any web server:
- Python: `python -m http.server 8080` (in `frontend/` directory)
- Node: `npx serve frontend -p 8080`
- VS Code: Right-click `frontend/index.html` → "Open with Live Server"

## Connect and Test

1. **Make sure both are running:**
   - ✅ Backend: `pnpm run server` (Terminal 1)
   - ✅ Frontend: Open in browser (http://localhost:8080)

2. **In the browser:**
   - Click "Connect"
   - Allow microphone access when prompted
   - Wait for "Agent joined the room!" message
   - Start speaking - the agent will respond!

## Troubleshooting

### "Token server error"
- Make sure backend is running: `pnpm run server`
- Check that port 3001 is not in use
- Verify `.env.local` has correct credentials

### "Agent not joining"
- Check backend logs for agent startup messages
- Look for "registered worker" message
- Verify `.env.local` has correct LiveKit credentials

### "Microphone access denied"
- Check browser permissions
- Use HTTPS or localhost (required for microphone)
- Try refreshing the page

### CORS errors
- Token server includes CORS headers automatically
- If issues persist, check browser console

## Architecture

```
┌─────────────┐
│   Browser   │ ← Frontend (index.html)
│  (Port 8080)│
└──────┬──────┘
       │
       ├─→ Combined Server (Port 3001)
       │   ├─ Token API (/token)
       │   └─ Agent Process (connects to LiveKit Cloud)
       │
       └─→ LiveKit Cloud
```

## Alternative: Separate Services

If you prefer to run services separately:

**Terminal 1 - Agent only:**
```bash
pnpm run dev
```

**Terminal 2 - Token server only:**
```bash
pnpm run token-server
```

**Terminal 3 - Frontend:**
```bash
pnpm run frontend
```

## Next Steps

- Customize the frontend UI in `frontend/index.html`
- Add more features (video, screen share, etc.)
- Deploy the combined server to production
- Use the React starter for a more advanced frontend: https://github.com/livekit-examples/agent-starter-react

