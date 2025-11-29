# ✅ What's Been Done Automatically

## Completed Steps

1. ✅ **Agent Name Configuration**
   - Added `LIVEKIT_AGENT_NAME=my-voice-agent` to `agent-starter-node/.env.local`
   - Updated agent code to read agent name from environment variable
   - Agent will now use explicit dispatch

2. ✅ **Environment Variables Prepared**
   - Added placeholder comments in `agent-starter-react/.env.local` for SIP trunk ID
   - Ready for you to uncomment and fill in after creating outbound trunk

3. ✅ **Code Implementation**
   - Outbound call API route ready
   - Frontend dialer UI ready
   - Agent handles SIP participants

---

## ❌ What You Still Need To Do Manually

### 1. Create Outbound Trunk in LiveKit (REQUIRED for outgoing calls)

**You need Twilio details first:**

1. **Get Twilio Termination URI:**
   - Go to [Twilio Console](https://console.twilio.com)
   - Navigate to: **Elastic SIP Trunking** → **Manage** → **Trunks**
   - Find or create a trunk
   - Copy the **Termination SIP URI** (format: `<trunk-name>.pstn.twilio.com`)

2. **Get Twilio Credentials:**
   - In Twilio Console: **Elastic SIP Trunking** → **Manage** → **Credential Lists**
   - Create a credential list with username/password (or use existing)
   - Associate it with your trunk: **Trunk** → **Termination** → **Authentication** → **Credential Lists**

3. **Create LiveKit Outbound Trunk:**
   ```bash
   cd agent-starter-node
   
   # Edit outbound-trunk-template.json with your details:
   # - address: your Twilio termination URI (e.g., "my-trunk.pstn.twilio.com")
   # - authUsername: your Twilio credential username
   # - authPassword: your Twilio credential password
   # - numbers: ["+19522990411"] (your Twilio number)
   
   # Then create:
   lk sip outbound create outbound-trunk.json
   
   # Copy the returned SipTrunkID (TR_xxx) - you'll need it next!
   ```

---

### 2. Update Dispatch Rule to Include Agent (REQUIRED for inbound calls)

**Option A: Using LiveKit Cloud Dashboard (Easiest)**
1. Go to [LiveKit Cloud Dashboard](https://cloud.livekit.io)
2. Navigate to: **Telephony** → **Configuration** → **Dispatch Rules**
3. Find rule `dispatch_twilio` (ID: `SDR_zQtqHnubL2n7`)
4. Click **Edit** or **Configure**
5. In the **Room Configuration** section, add:
   ```json
   {
     "agents": [
       {
         "agentName": "my-voice-agent"
       }
     ]
   }
   ```
6. Save

**Option B: Using CLI (if you have the correct format)**
The CLI update command needs the exact request format. You can:
- Use the Cloud dashboard (easier)
- Or check the LiveKit docs for the exact JSON format needed

---

### 3. Add Outbound Trunk ID to Environment Variables

After creating the outbound trunk in step 1:

**Edit `agent-starter-react/.env.local`:**
```env
# Uncomment and fill in:
LIVEKIT_SIP_TRUNK_ID=TR_xxx  # Replace TR_xxx with actual trunk ID from step 1
LIVEKIT_SIP_FROM_NUMBER=+19522990411  # Optional, defaults to trunk number
```

---

### 4. Restart Services

```bash
# Terminal 1: Restart agent
cd agent-starter-node
pnpm dev

# Terminal 2: Restart frontend  
cd agent-starter-react
pnpm dev
```

---

## 🎯 Quick Summary

**What's Ready:**
- ✅ Code implementation complete
- ✅ Agent name configured
- ✅ Environment files prepared

**What You Need:**
1. **Twilio Console**: Get termination URI and credentials
2. **LiveKit CLI**: Create outbound trunk (`lk sip outbound create`)
3. **LiveKit Dashboard**: Update dispatch rule to include agent
4. **Environment**: Add `LIVEKIT_SIP_TRUNK_ID` to React app
5. **Restart**: Both services

**Estimated Time:** 10-15 minutes

---

## 🧪 Testing After Setup

**Test Outbound (Web → Phone):**
1. Open http://localhost:3000
2. Click "Start call"
3. Enter phone number (E.164 format: `+14155550123`)
4. Click "Call phone"
5. Phone should ring and connect to agent

**Test Inbound (Phone → Agent):**
1. Call `+19522990411` from any phone
2. Should automatically connect to agent
3. Agent should greet caller

---

## 📞 Need Help?

- **Twilio Setup**: [Twilio SIP Trunking Docs](https://www.twilio.com/docs/sip-trunking)
- **LiveKit Setup**: See `SETUP_TWILIO_CALLS.md`
- **Current Status**: See `TWILIO_SETUP_STATUS.md`

