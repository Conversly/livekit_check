# Twilio Configuration Guide - Based on Your Screenshots

## ✅ What You Already Have Configured

### 1. Twilio Elastic SIP Trunk
- **Trunk Name**: `livekit`
- **Trunk SID**: `TK0a201a163eb988d3b1786fcf045b113b`
- **Origination URI**: `sip:2zr4w6m4ud3.sip.livekit.cloud;transport=tcp` ✅
  - This is correctly configured for **inbound calls** (Twilio → LiveKit)

### 2. LiveKit SIP Domain
- **SIP Domain**: `2zr4w6m4ud3.sip.livekit.cloud`
- This matches your LiveKit project

### 3. API Credentials
- **Account SID**: `AC1446d3d5415b74300ce46e04481b1f37`
- **API Key**: `livekit_api` (SID: `SK4b4ef65daf9bd0a7264d1e48a32e877`)

---

## ❌ What's Missing (Required for Outbound Calls)

### 1. Termination SIP URI (CRITICAL)

**From your screenshot**: The Termination SIP URI field is **empty**.

**What to do:**
1. Go to Twilio Console → Elastic SIP Trunking → Trunks → `livekit` → **Termination** tab
2. In the "Termination SIP URI" field, enter your trunk name: `livekit`
   - The full URI will be: `livekit.pstn.twilio.com`
   - This is what LiveKit will use to send outbound calls to Twilio

3. Click **"Show Localized URIs"** if you want a region-specific URI (optional, but recommended for lower latency)

4. **Save** the configuration

---

### 2. Authentication for Termination (CRITICAL)

**From your screenshot**: No Credential Lists are configured for termination.

**What to do:**

1. **Create a Credential List:**
   - Go to Twilio Console → Elastic SIP Trunking → **Credential Lists**
   - Click **"Create new Credential List"**
   - Give it a name (e.g., `livekit-outbound`)
   - Click **"Create"**

2. **Add Credentials to the List:**
   - Click on the credential list you just created
   - Click **"Add Credentials"**
   - Enter:
     - **Username**: Choose something (e.g., `livekit_user`)
     - **Password**: Generate a strong password (save this!)
   - Click **"Add"**

3. **Associate Credential List with Trunk:**
   - Go back to: Elastic SIP Trunking → Trunks → `livekit` → **Termination** tab
   - Under **"Credential Lists"** section
   - Click the dropdown → Select your credential list (`livekit-outbound`)
   - Click **Save**

**Important**: Save the username and password - you'll need them for the LiveKit outbound trunk!

---

## 📋 Next Steps After Configuring Twilio

### Step 1: Create LiveKit Outbound Trunk

Once you have:
- ✅ Termination SIP URI: `livekit.pstn.twilio.com` (or the localized version)
- ✅ Username: `livekit_user` (or whatever you chose)
- ✅ Password: (the password you created)

**Create the outbound trunk:**

```bash
cd agent-starter-node

# Edit outbound-trunk-template.json with your details:
cat > outbound-trunk.json << 'EOF'
{
  "trunk": {
    "name": "Twilio Outbound Trunk",
    "address": "livekit.pstn.twilio.com",
    "numbers": ["+19522990411"],
    "authUsername": "livekit_user",
    "authPassword": "YOUR_PASSWORD_HERE"
  }
}
EOF

# Replace YOUR_PASSWORD_HERE with actual password, then:
lk sip outbound create outbound-trunk.json

# Copy the returned SipTrunkID (TR_xxx)
```

### Step 2: Add Trunk ID to Environment

Edit `agent-starter-react/.env.local`:
```env
LIVEKIT_SIP_TRUNK_ID=TR_xxx  # Replace with actual trunk ID from Step 1
LIVEKIT_SIP_FROM_NUMBER=+19522990411
```

### Step 3: Restart Services

```bash
# Terminal 1
cd agent-starter-node && pnpm dev

# Terminal 2  
cd agent-starter-react && pnpm dev
```

---

## 🔍 Verification Checklist

- [ ] Termination SIP URI configured in Twilio (`livekit.pstn.twilio.com`)
- [ ] Credential List created with username/password
- [ ] Credential List associated with trunk
- [ ] LiveKit outbound trunk created
- [ ] `LIVEKIT_SIP_TRUNK_ID` added to React `.env.local`
- [ ] Services restarted

---

## 📝 Quick Reference

**Twilio Console Links:**
- Trunk Settings: https://console.twilio.com/us1/develop/sip-trunking/trunks/TK0a201a163eb988d3b1786fcf045b113b
- Credential Lists: https://console.twilio.com/us1/develop/sip-trunking/credential-lists

**Your Configuration:**
- Trunk Name: `livekit`
- Trunk SID: `TK0a201a163eb988d3b1786fcf045b113b`
- LiveKit SIP Domain: `2zr4w6m4ud3.sip.livekit.cloud`
- Phone Number: `+19522990411`

---

## ⚠️ Important Notes

1. **Termination URI**: Must be filled in for outbound calls to work
2. **Authentication**: Required - Twilio will reject calls without proper credentials
3. **Password Security**: Keep your credential password secure - don't commit it to git
4. **Localized URIs**: Consider using a region-specific URI for better performance

