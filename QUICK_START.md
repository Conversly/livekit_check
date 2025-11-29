# Quick Start - Complete Setup Commands

## 🚀 Agent Setup (One-Time)

```bash
# Navigate to agent directory
cd agent-starter-node

# Install all dependencies
pnpm install

# Download required model files (VAD, etc.)
pnpm run download-files

# Start agent in development mode
pnpm dev
```

---

## 📞 Complete Twilio + LiveKit Setup

### Step 1: Create Outbound Trunk (You've already configured credentials ✅)

```bash
cd agent-starter-node
lk sip outbound create outbound-trunk.json
```

**Copy the returned `SipTrunkID` (TR_xxx)** - you'll need it!

### Step 2: Add Trunk ID to React Environment

Edit `agent-starter-react/.env.local`:
```env
LIVEKIT_SIP_TRUNK_ID=TR_xxx  # Replace with trunk ID from Step 1
LIVEKIT_SIP_FROM_NUMBER=+19522990411
```

### Step 3: Start Both Services

**Terminal 1 - Agent:**
```bash
cd agent-starter-node
pnpm dev
```

**Terminal 2 - Frontend:**
```bash
cd agent-starter-react
pnpm install  # If not already done
pnpm dev
```

---

## ✅ Verification

**Check everything is configured:**
```bash
# Check outbound trunk exists
lk sip outbound list

# Check dispatch rule has agent
lk sip dispatch list

# Check agent is running (look for "Agent entering" logs)
# Check frontend is running (http://localhost:3000)
```

---

## 🧪 Test Outbound Calls

1. Open http://localhost:3000
2. Click **"Start call"** to connect to agent
3. Enter phone number (E.164 format: `+14155550123`)
4. Click **"Call phone"**
5. Phone should ring! 📞

---

## 📋 All Commands Reference

### Agent Commands
```bash
cd agent-starter-node

pnpm install          # Install dependencies
pnpm run download-files  # Download models
pnpm dev              # Start development
pnpm build            # Build for production
pnpm start            # Start production
pnpm test             # Run tests
pnpm lint             # Run linter
```

### LiveKit CLI Commands
```bash
lk sip outbound list           # List outbound trunks
lk sip inbound list            # List inbound trunks
lk sip dispatch list           # List dispatch rules
lk sip outbound create <file>  # Create outbound trunk
```

### Frontend Commands
```bash
cd agent-starter-react

pnpm install    # Install dependencies
pnpm dev        # Start development server
pnpm build      # Build for production
pnpm start      # Start production server
```

---

## 🎯 Current Status

✅ **Twilio Configuration:**
- Termination URI: `livekit_1.pstn.twilio.com`
- Credentials: Configured in `outbound-trunk.json`

✅ **Agent Configuration:**
- Agent name: `my-voice-agent`
- Environment: Configured

✅ **Code:**
- Outbound API: Ready
- Frontend UI: Ready
- Dispatch rule: Configured

⚠️ **Remaining:**
- Create LiveKit outbound trunk
- Add trunk ID to React `.env.local`
- Start services

---

## ⏱️ Estimated Time: 2 minutes

You're almost done! Just:
1. Create trunk (`lk sip outbound create`)
2. Add env var
3. Start services
4. Test!

