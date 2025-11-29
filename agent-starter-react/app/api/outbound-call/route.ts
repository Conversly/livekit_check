import { NextResponse } from 'next/server';
import { SipClient } from 'livekit-server-sdk';

const LIVEKIT_URL = process.env.LIVEKIT_URL;
const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY;
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET;
const LIVEKIT_SIP_TRUNK_ID = process.env.LIVEKIT_SIP_TRUNK_ID;
const LIVEKIT_SIP_FROM_NUMBER = process.env.LIVEKIT_SIP_FROM_NUMBER;

export async function POST(request: Request) {
  if (!LIVEKIT_URL || !LIVEKIT_API_KEY || !LIVEKIT_API_SECRET || !LIVEKIT_SIP_TRUNK_ID) {
    return NextResponse.json(
      { error: 'Missing required environment variables' },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { number, roomName } = body;

    if (!number || !roomName) {
      return NextResponse.json(
        { error: 'Phone number and room name are required' },
        { status: 400 }
      );
    }

    const sipClient = new SipClient(LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET);

    // Normalize number (basic normalization, ensure it starts with +)
    let normalizedNumber = number.replace(/\s+/g, '').replace(/-/g, '');
    if (!normalizedNumber.startsWith('+')) {
      normalizedNumber = `+${normalizedNumber}`;
    }

    const participant = await sipClient.createSipParticipant(
      LIVEKIT_SIP_TRUNK_ID,
      normalizedNumber,
      roomName,
      {
        participantIdentity: `sip_${normalizedNumber}`,
        participantName: normalizedNumber,
        waitUntilAnswered: false,
        playDialtone: true,
        hidePhoneNumber: true, // Optional: hide the from number if supported/desired
        fromNumber: LIVEKIT_SIP_FROM_NUMBER,
      },
    );

    return NextResponse.json({ participantId: participant.sid });
  } catch (error) {
    console.error('Error creating SIP participant:', error);
    return NextResponse.json(
      { error: 'Failed to initiate call' },
      { status: 500 }
    );
  }
}
