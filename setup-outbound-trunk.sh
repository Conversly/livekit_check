#!/bin/bash
# Script to complete outbound trunk setup

echo "=== LiveKit Outbound Trunk Setup ==="
echo ""
echo "Step 1: Make sure you've added credentials to Twilio credential list 'livekit_1'"
echo "        - Go to Twilio Console → Credential Lists → livekit_1"
echo "        - Add username/password"
echo ""
read -p "Have you added credentials to the Twilio credential list? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Please add credentials first, then run this script again."
    exit 1
fi

echo ""
echo "Step 2: Enter the username you used in Twilio credential list:"
read -p "Username: " TWILIO_USERNAME

echo ""
echo "Step 3: Enter the password you used in Twilio credential list:"
read -sp "Password: " TWILIO_PASSWORD
echo ""

cd agent-starter-node

# Update outbound-trunk.json
cat > outbound-trunk.json << EOF
{
  "trunk": {
    "name": "Twilio Outbound Trunk",
    "address": "livekit_1.pstn.twilio.com",
    "numbers": ["+19522990411"],
    "authUsername": "${TWILIO_USERNAME}",
    "authPassword": "${TWILIO_PASSWORD}"
  }
}
EOF

echo ""
echo "✅ Updated outbound-trunk.json with your credentials"
echo ""
echo "Step 4: Creating LiveKit outbound trunk..."
echo ""

lk sip outbound create outbound-trunk.json

echo ""
echo "✅ Copy the SipTrunkID (TR_xxx) from above"
echo ""
echo "Step 5: Add it to agent-starter-react/.env.local:"
echo "   LIVEKIT_SIP_TRUNK_ID=TR_xxx"
echo ""
