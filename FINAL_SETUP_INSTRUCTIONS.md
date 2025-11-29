# Final Setup Instructions - Complete Now!

## ✅ What's Already Configured (from your screenshots)

1. ✅ **Twilio Termination URI**: `livekit_1.pstn.twilio.com` 
2. ✅ **Credential List**: `livekit_1` selected
3. ✅ **LiveKit Outbound Trunk JSON**: Created at `agent-starter-node/outbound-trunk.json`
4. ✅ **LiveKit Inbound Trunks**: Configured
5. ✅ **Dispatch Rule**: Configured with agent `my-voice-agent`
6. ✅ **Code**: All implementation complete

---

## ⚠️ What You Need to Do RIGHT NOW

### Step 1: Add Credentials to Twilio Credential List (2 minutes)

**The red warning in your screenshot means you need to add actual username/password to the credential list.**

1. Go to: [Twilio Console → Credential Lists](https://console.twilio.com/us1/develop/sip-trunking/credential-lists)
2. Click on credential list: **`livekit_1`**
3. Click **"Add Credentials"** button
4. Enter:
   - **Username**: `livekit_user` (or any username you want)
   - **Password**: Create a strong password (save this!)
5. Click **"Add"**
6. Go back to: Trunk → Termination tab
7. Verify `livekit_1` is selected in Credential Lists dropdown
8. Click **"Save"** (warning should disappear)

---

### Step 2: Create LiveKit Outbound Trunk (1 minute)

**Option A: Use the automated script:**
```bash
cd /Users/raghvendradhakar/Desktop/code/conversly/livekit
./setup-outbound-trunk.sh
```

**Option B: Manual steps:**
```bash
cd agent-starter-node

# Edit outbound-trunk.json - replace CHANGE_THIS_PASSWORD with your actual password
# The file is already created with correct address: livekit_1.pstn.twilio.com

# Then create the trunk:
lk sip outbound create outbound-trunk.json

# Copy the returned SipTrunkID (TR_xxx)
```

---

### Step 3: Add Trunk ID to Environment (30 seconds)

Edit `agent-starter-react/.env.local` and add:
```env
LIVEKIT_SIP_TRUNK_ID=TR_xxx  # Replace with actual trunk ID from Step 2
LIVEKIT_SIP_FROM_NUMBER=+19522990411
```

---

### Step 4: Restart Services (1 minute)

```bash
# Terminal 1: Restart agent
cd agent-starter-node
pnpm dev

# Terminal 2: Restart frontend
cd agent-starter-react
pnpm dev
```

---

## 🧪 Test It!

1. Open http://localhost:3000
2. Click **"Start call"** 
3. Enter a phone number: `+14155550123` (or any E.164 format)
4. Click **"Call phone"**
5. Your phone should ring! 📞

---

## 📋 Quick Checklist

- [ ] Added username/password to Twilio credential list `livekit_1`
- [ ] Saved termination settings in Twilio (warning gone)
- [ ] Updated `outbound-trunk.json` with actual password
- [ ] Created LiveKit outbound trunk (`lk sip outbound create`)
- [ ] Added `LIVEKIT_SIP_TRUNK_ID` to React `.env.local`
- [ ] Restarted both services
- [ ] Tested outbound call

---

## 🎯 Current Configuration Summary

**Twilio:**
- Termination URI: `livekit_1.pstn.twilio.com` ✅
- Credential List: `livekit_1` ✅ (needs credentials added)
- Phone Number: `+19522990411` ✅

**LiveKit:**
- Inbound Trunks: 2 configured ✅
- Outbound Trunks: 0 (needs creation) ⚠️
- Dispatch Rule: Configured with agent ✅

**Code:**
- Agent name: `my-voice-agent` ✅
- Outbound API: Ready ✅
- Frontend UI: Ready ✅

---

## ⏱️ Estimated Time: 5 minutes

You're 90% done! Just need to:
1. Add credentials to Twilio (2 min)
2. Create LiveKit trunk (1 min)
3. Add env var (30 sec)
4. Restart & test (1 min)

