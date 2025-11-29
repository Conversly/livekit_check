# Quick Setup Guide: Twilio + LiveKit Phone Calls

## Current Status Summary

✅ **Already Done:**
- Inbound trunks configured (2 trunks)
- Dispatch rule exists (`SDR_zQtqHnubL2n7`)
- Code implementation complete
- Agent handles SIP participants

❌ **Still Needed:**
1. Create outbound trunk in LiveKit
2. Add agent name to agent code (✅ JUST FIXED)
3. Update dispatch rule to include agent
4. Add environment variables

---

## Step-by-Step Setup

### Step 1: Configure Agent Name (✅ DONE)

The agent now reads `LIVEKIT_AGENT_NAME` from env or defaults to `my-voice-agent`.

**Add to `agent-starter-node/.env.local`:**
```env
LIVEKIT_AGENT_NAME=my-voice-agent
```

---

### Step 2: Create Outbound Trunk in LiveKit

**First, get your Twilio trunk details:**
1. Go to [Twilio Console](https://console.twilio.com) → Elastic SIP Trunking → Trunks
2. Find or create a trunk
3. Copy the **Termination SIP URI** (format: `<trunk-name>.pstn.twilio.com`)
4. Go to Credential Lists → Create one with username/password

**Then create LiveKit outbound trunk:**

```bash
cd agent-starter-node

# Edit the template with your Twilio details
cp outbound-trunk-template.json outbound-trunk.json
# Edit outbound-trunk.json with:
# - address: your Twilio termination URI (e.g., "my-trunk.pstn.twilio.com")
# - authUsername: your Twilio credential username
# - authPassword: your Twilio credential password
# - numbers: ["+19522990411"] (your Twilio number)

# Create the trunk
lk sip outbound create outbound-trunk.json

# Copy the returned SipTrunkID (TR_xxx) - you'll need it for Step 4
```

---

### Step 3: Update Dispatch Rule to Include Agent

```bash
cd agent-starter-node

# Edit dispatch-rule-update-template.json
# Make sure agentName matches what you set in Step 1

# Update the existing dispatch rule
lk sip dispatch update --id SDR_zQtqHnubL2n7 dispatch-rule-update-template.json
```

**Verify it worked:**
```bash
lk sip dispatch list
# Should show agents: ["my-voice-agent"] in the output
```

---

### Step 4: Add Environment Variables

**Add to `agent-starter-react/.env.local`:**
```env
# Existing vars (already there)
LIVEKIT_URL=wss://verlyai-fjmbd34k.livekit.cloud
LIVEKIT_API_KEY=APIL3GZDeGsa2Hq
LIVEKIT_API_SECRET=65qDaVl2OdXWdGKWYPCntWT0N9L3l8rzn0r8cjN9EgM

# NEW: Add these (replace TR_xxx with actual outbound trunk ID from Step 2)
LIVEKIT_SIP_TRUNK_ID=TR_xxx
LIVEKIT_SIP_FROM_NUMBER=+19522990411  # Optional, defaults to trunk number
```

**Add to `agent-starter-node/.env.local`:**
```env
# Existing vars (already there)
LIVEKIT_URL=wss://verlyai-fjmbd34k.livekit.cloud
LIVEKIT_API_KEY=APIL3GZDeGsa2Hq
LIVEKIT_API_SECRET=65qDaVl2OdXWdGKWYPCntWT0N9L3l8rzn0r8cjN9EgM

# NEW: Add agent name
LIVEKIT_AGENT_NAME=my-voice-agent
```

---

### Step 5: Restart Services

```bash
# Stop both services if running, then:

# Terminal 1: Start agent
cd agent-starter-node
pnpm dev

# Terminal 2: Start frontend
cd agent-starter-react
pnpm dev
```

---

## Testing

### Test Outbound Calls (Web → Phone)
1. Open http://localhost:3000
2. Click "Start call" to connect to agent
3. Enter a phone number in E.164 format (e.g., `+14155550123`)
4. Click "Call phone"
5. The phone should ring and connect to the agent

### Test Inbound Calls (Phone → Agent)
1. Call `+19522990411` from any phone
2. Should automatically connect to your agent
3. Agent should greet the caller

---

## Troubleshooting

**Outbound calls not working?**
- Check `LIVEKIT_SIP_TRUNK_ID` is set correctly
- Verify outbound trunk exists: `lk sip outbound list`
- Check agent is running with correct `agentName`
- Check browser console for API errors

**Inbound calls not connecting to agent?**
- Verify dispatch rule has agents: `lk sip dispatch list`
- Check agent name matches in dispatch rule and agent code
- Verify agent is running: check agent logs
- Check Twilio phone number is configured to route to LiveKit SIP domain

**Agent not joining rooms?**
- Verify `LIVEKIT_AGENT_NAME` matches in:
  - Agent code (env var or default)
  - Dispatch rule (`roomConfig.agents[0].agentName`)
  - Frontend (if using `appConfig.agentName`)

---

## Quick Reference

**LiveKit CLI Commands:**
```bash
# List trunks
lk sip outbound list
lk sip inbound list

# List dispatch rules
lk sip dispatch list

# Create outbound trunk
lk sip outbound create outbound-trunk.json

# Update dispatch rule
lk sip dispatch update --id SDR_zQtqHnubL2n7 dispatch-rule-update-template.json
```

**Current Configuration:**
- Project: `verlyai`
- Inbound Trunk: `ST_my8HUVCHRGNY` (+19522990411)
- Dispatch Rule: `SDR_zQtqHnubL2n7`
- Agent Name: `my-voice-agent` (configurable via env)

