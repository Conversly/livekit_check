# Quick Start Guide

## 🚀 Run Everything (2 Terminals Only!)

### Terminal 1: Backend (Agent + Token Server)
```bash
pnpm run server
```

This starts:
- ✅ Token server on `http://localhost:3001`
- ✅ LiveKit agent (connects to LiveKit Cloud)

### Terminal 2: Frontend
```bash
pnpm run frontend
```

Then open: **http://localhost:8080**

---

## 📋 What You'll See

**Backend Terminal:**
```
🚀 Token server running on http://localhost:3001
📝 POST /token with { roomName, participantName }
🤖 Starting LiveKit agent...
[Agent logs...]
```

**Browser:**
1. Click "Connect"
2. Allow microphone access
3. Wait for "Agent joined the room!"
4. Start speaking!

---

## ✅ Checklist

- [ ] Dependencies installed: `pnpm install`
- [ ] `.env.local` file exists with LiveKit credentials
- [ ] Backend running: `pnpm run server`
- [ ] Frontend running: `pnpm run frontend`
- [ ] Browser opened: http://localhost:8080

---

## 🐛 Troubleshooting

**"Token server error"**
→ Check backend is running and port 3001 is free

**"Agent not joining"**
→ Check backend logs for "registered worker" message

**"Microphone access denied"**
→ Allow microphone permissions in browser

---

That's it! You're ready to test your voice AI agent! 🎉

