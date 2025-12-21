import { NextResponse } from 'next/server';
import { SipClient } from 'livekit-server-sdk';

const API_KEY = process.env.LIVEKIT_API_KEY;
const API_SECRET = process.env.LIVEKIT_API_SECRET;
const LIVEKIT_URL = process.env.LIVEKIT_URL || 'wss://verlyai-fjmbd34k.livekit.cloud';

// Convert wss:// to https:// for API calls
const baseUrl = LIVEKIT_URL.replace(/^wss:/, 'https:');

const TRUNK_ID = 'ST_BmPtG3V83P9r';

// Twilio credentials
const TWILIO_ACCOUNT_SID = 'AC1446d3d5415b74300ce46e04481b1f37';
const TWILIO_AUTH_TOKEN = '5502cd9a889207f9302185917c5f427d';
const TWILIO_PHONE_NUMBER = '+19522990411';
const TRUNK_DOMAIN = 'livekit_1.pstn.twilio.com';

export async function POST() {
  if (!API_KEY || !API_SECRET) {
    return NextResponse.json(
      { error: 'Missing LIVEKIT_API_KEY or LIVEKIT_API_SECRET' },
      { status: 500 }
    );
  }

  try {
    console.log('🔧 Updating Twilio Outbound Trunk...');
    console.log(`Trunk ID: ${TRUNK_ID}`);
    console.log(`Account SID: ${TWILIO_ACCOUNT_SID}`);
    console.log(`Phone Number: ${TWILIO_PHONE_NUMBER}`);
    console.log(`Domain: ${TRUNK_DOMAIN}`);

    const sipClient = new SipClient(baseUrl, API_KEY, API_SECRET);

    // Update the trunk
    const updatedTrunk = await sipClient.updateSipOutboundTrunk(
      TRUNK_ID,
      {
        name: 'Twilio Outbound Trunk',
        address: TRUNK_DOMAIN,
        numbers: [TWILIO_PHONE_NUMBER],
        authUsername: TWILIO_ACCOUNT_SID,
        authPassword: TWILIO_AUTH_TOKEN,
      }
    );

    console.log('✅ Trunk updated successfully!');
    console.log(`Trunk ID: ${updatedTrunk.sipTrunkId}`);
    console.log(`Name: ${updatedTrunk.name}`);
    console.log(`Address: ${updatedTrunk.address}`);
    console.log(`Numbers: ${updatedTrunk.numbers.join(', ')}`);

    return NextResponse.json({
      success: true,
      trunk: {
        sipTrunkId: updatedTrunk.sipTrunkId,
        name: updatedTrunk.name,
        address: updatedTrunk.address,
        numbers: updatedTrunk.numbers,
      },
      message: 'Trunk updated successfully! You can now make outbound calls.',
    });

  } catch (error: any) {
    console.error('❌ Error updating trunk:', error);
    return NextResponse.json(
      {
        error: 'Failed to update trunk',
        message: error.message,
        details: error.message.includes('403') || error.message.includes('Forbidden')
          ? 'This might be a permissions issue. Check your API key has SIP permissions.'
          : undefined,
      },
      { status: 500 }
    );
  }
}



