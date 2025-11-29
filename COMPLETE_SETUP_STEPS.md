# Complete Setup Steps - Final Checklist

## ✅ What You've Done in Twilio

1. ✅ Termination SIP URI: `livekit_1.pstn.twilio.com` (configured)
2. ✅ Credential List: `livekit_1` (selected)
3. ⚠️ **ACTION NEEDED**: Add credentials to the credential list

---

## 🔧 Step 1: Complete Twilio Credential List Setup

**The warning shows you need to add actual credentials to the credential list.**

1. Go to Twilio Console → **Elastic SIP Trunking** → **Credential Lists**
2. Click on the credential list: `livekit_1`
3. Click **"Add Credentials"** button
4. Enter:
   - **Username**: `livekit_user` (or any username you prefer)
   - **Password**: Generate a strong password (e.g., use Twilio's generator or create your own)
   - **IMPORTANT**: Save this password - you'll need it for LiveKit!
5. Click **"Add"**
6. Go back to Trunk → Termination tab
7. Make sure `livekit_1` credential list is selected
8. Click **"Save"** (the warning should disappear)

---

## 🔧 Step 2: Create LiveKit Outbound Trunk

**After you have the username/password from Step 1:**

```bash
cd agent-starter-node

# Edit outbound-trunk.json with your actual password:
# Replace CHANGE_THIS_PASSWORD with the password from Step 1

# Then create the trunk:
lk sip outbound create outbound-trunk.json

# Copy the returned SipTrunkID (TR_xxx) - you'll need it!
```

**The file is already created at: `agent-starter-node/outbound-trunk.json`**

You just need to:
1. Replace `CHANGE_THIS_PASSWORD` with your actual password
2. Optionally change `authUsername` if you used a different username
3. Run the `lk sip outbound create` command

---

## 🔧 Step 3: Add Trunk ID to Environment

**After creating the outbound trunk, edit `agent-starter-react/.env.local`:**

```env
# Add these lines (uncomment if they're commented):
LIVEKIT_SIP_TRUNK_ID=TR_xxx  # Replace TR_xxx with actual trunk ID from Step 2
LIVEKIT_SIP_FROM_NUMBER=+19522990411
```

---

## 🔧 Step 4: Activate Routing (Optional but Recommended)

**In Twilio Console → Trunk → Termination tab:**

1. Under "Routing" section
2. Click **"Re-route"** button
3. This activates regional routing for better performance

---

## 🔧 Step 5: Restart Services

```bash
# Terminal 1: Restart agent
cd agent-starter-node
pnpm dev

# Terminal 2: Restart frontend
cd agent-starter-react
pnpm dev
```

---

## ✅ Final Verification

**Check everything is configured:**

```bash
# Check outbound trunk exists
lk sip outbound list

# Check dispatch rule has agent
lk sip dispatch list

# Check environment variables
cd agent-starter-react && grep LIVEKIT_SIP_TRUNK_ID .env.local
```

---

## 🧪 Test Outbound Calls

1. Open http://localhost:3000
2. Click **"Start call"** to connect to agent
3. Enter a phone number (E.164 format: `+14155550123`)
4. Click **"Call phone"**
5. Phone should ring and connect to agent!

---

## 📋 Quick Summary

**What's Done:**
- ✅ Twilio Termination URI configured
- ✅ Credential list selected
- ✅ LiveKit inbound trunks configured
- ✅ Dispatch rule with agent configured
- ✅ Code implementation complete

**What You Need to Do:**
1. Add username/password to credential list `livekit_1` in Twilio
2. Save termination settings in Twilio
3. Update `outbound-trunk.json` with actual password
4. Create LiveKit outbound trunk (`lk sip outbound create`)
5. Add `LIVEKIT_SIP_TRUNK_ID` to React `.env.local`
6. Restart services

**Estimated Time:** 5 minutes

