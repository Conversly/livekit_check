# Twilio + LiveKit Integration Status

## ✅ Already Configured in LiveKit

### Inbound Trunks (2 configured)
1. **`ST_b8fCasBg2eU2`** - "Twilio Inbound Trunk with Auth"
   - Has authentication: `twilio_user / ****`
   - Ready for inbound calls

2. **`ST_my8HUVCHRGNY`** - "twilio"
   - Phone number: `+19522990411`
   - Used by dispatch rule

### Dispatch Rule
- **`SDR_zQtqHnubL2n7`** - "dispatch_twilio"
  - Routes calls to individual rooms: `call-_<caller>_<random>`
  - Uses trunk: `ST_my8HUVCHRGNY`
  - ⚠️ **ISSUE**: No agents configured in dispatch rule

### Code Implementation
- ✅ Outbound call API route (`/api/outbound-call`)
- ✅ Frontend UI with phone dialer form
- ✅ Agent handles SIP participants (noise cancellation)

---

## ❌ Missing Configuration

### 1. Outbound Trunk (CRITICAL - Required for outgoing calls)
**Status**: No outbound trunks exist

**What to do:**
```bash
# Create outbound-trunk.json
cat > outbound-trunk.json << 'EOF'
{
  "trunk": {
    "name": "Twilio Outbound Trunk",
    "address": "<your-trunk>.pstn.twilio.com",
    "numbers": ["+19522990411"],
    "authUsername": "<twilio_username>",
    "authPassword": "<twilio_password>"
  }
}
EOF

# Create the trunk
lk sip outbound create outbound-trunk.json

# Copy the returned SipTrunkID (TR_xxx)
```

**Twilio Setup Required:**
- Create Elastic SIP Trunk in Twilio Console
- Configure termination URI: `<your-trunk>.pstn.twilio.com`
- Create credential list with username/password
- Associate credential list with trunk for authentication

---

### 2. Agent Name Configuration (CRITICAL - Required for dispatch)
**Status**: Agent doesn't have `agent_name` set

**Current code:**
```typescript
// agent-starter-node/src/agent.ts:563
cli.runApp(new ServerOptions({ agent: fileURLToPath(import.meta.url) }));
```

**What to change:**
```typescript
cli.runApp(new ServerOptions({ 
  agent: fileURLToPath(import.meta.url),
  agentName: "my-voice-agent"  // Add this
}));
```

**Why needed:**
- Enables explicit agent dispatch
- Required for both inbound and outbound calls
- Must match the name used in dispatch rules and frontend

---

### 3. Dispatch Rule Agents (CRITICAL - Required for inbound calls)
**Status**: Dispatch rule exists but has no agents configured

**Current dispatch rule:**
- Name: `dispatch_twilio`
- ID: `SDR_zQtqHnubL2n7`
- Agents: **EMPTY** ❌

**What to do:**
```bash
# Update dispatch rule to include agent
cat > dispatch-rule-update.json << 'EOF'
{
  "dispatch_rule": {
    "rule": {
      "dispatchRuleIndividual": {
        "roomPrefix": "call-"
      }
    },
    "roomConfig": {
      "agents": [{
        "agentName": "my-voice-agent"
      }]
    }
  }
}
EOF

# Update the dispatch rule
lk sip dispatch update --id SDR_zQtqHnubL2n7 dispatch-rule-update.json
```

---

### 4. Environment Variables (Required for outbound calls)
**Status**: Missing SIP trunk ID in React app

**Current `.env.local` (agent-starter-react):**
```env
LIVEKIT_URL=wss://verlyai-fjmbd34k.livekit.cloud
LIVEKIT_API_KEY=APIL3GZDeGsa2Hq
LIVEKIT_API_SECRET=65qDaVl2OdXWdGKWYPCntWT0N9L3l8rzn0r8cjN9EgM
```

**What to add:**
```env
# After creating outbound trunk, add:
LIVEKIT_SIP_TRUNK_ID=TR_xxx  # Replace with actual outbound trunk ID
LIVEKIT_SIP_FROM_NUMBER=+19522990411  # Optional, defaults to trunk number
```

---

## 📋 Action Checklist

### For Outbound Calls (Making calls from web UI):
- [ ] Create Twilio Elastic SIP Trunk with termination URI
- [ ] Create LiveKit outbound trunk (`lk sip outbound create`)
- [ ] Add `LIVEKIT_SIP_TRUNK_ID` to `agent-starter-react/.env.local`
- [ ] Add `agentName` to agent ServerOptions
- [ ] Restart Next.js dev server

### For Inbound Calls (Receiving calls):
- [ ] Add `agentName` to agent ServerOptions
- [ ] Update dispatch rule to include agent in `roomConfig.agents`
- [ ] Configure Twilio phone number to route to LiveKit SIP domain
- [ ] Test by calling `+19522990411`

---

## 🔍 Verification Commands

```bash
# Check outbound trunks
lk sip outbound list

# Check inbound trunks
lk sip inbound list

# Check dispatch rules
lk sip dispatch list

# Check agent configuration
grep -n "agentName\|agent_name" agent-starter-node/src/agent.ts
```

---

## 📝 Notes

- **Twilio Phone Number**: `+19522990411` is already configured
- **LiveKit Project**: `verlyai` (default)
- **Inbound trunk with auth**: `ST_b8fCasBg2eU2` has credentials ready
- **Current dispatch rule**: Routes to `call-_<caller>_<random>` rooms but no agent auto-dispatch

---

## 🚀 Quick Start (After completing checklist)

1. **Start agent** with agent name:
   ```bash
   cd agent-starter-node
   pnpm dev
   ```

2. **Start frontend**:
   ```bash
   cd agent-starter-react
   pnpm dev
   ```

3. **Test outbound**: Open web UI → Connect → Enter phone number → Click "Call phone"

4. **Test inbound**: Call `+19522990411` → Should connect to agent automatically

