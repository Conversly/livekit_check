import { NextResponse } from 'next/server';
import { AccessToken, type AccessTokenOptions, type VideoGrant, RoomServiceClient, SipClient, AgentDispatchClient } from 'livekit-server-sdk';
import { RoomConfiguration } from '@livekit/protocol';

// NOTE: you are expected to define the following environment variables in `.env.local`:
const API_KEY = process.env.LIVEKIT_API_KEY;
const API_SECRET = process.env.LIVEKIT_API_SECRET;
const LIVEKIT_URL = process.env.LIVEKIT_URL;
const OUTBOUND_TRUNK_ID = process.env.LIVEKIT_OUTBOUND_TRUNK_ID || 'ST_BmPtG3V83P9r'; // Default: Twilio Outbound Trunk
const AGENT_NAME = process.env.LIVEKIT_AGENT_NAME || 'my-telephony-agent'; // Default agent name

// don't cache the results
export const revalidate = 0;

export async function POST(req: Request) {
  try {
    if (LIVEKIT_URL === undefined) {
      throw new Error('LIVEKIT_URL is not defined');
    }
    if (API_KEY === undefined) {
      throw new Error('LIVEKIT_API_KEY is not defined');
    }
    if (API_SECRET === undefined) {
      throw new Error('LIVEKIT_API_SECRET is not defined');
    }

    // Parse request body
    const body = await req.json();
    const phoneNumber: string = body?.phone_number;
    const agentConfig = body?.agent_config;

    if (!phoneNumber) {
      return new NextResponse('Phone number is required', { status: 400 });
    }

    // Validate phone number format (should be E.164 format: +1234567890)
    if (!phoneNumber.startsWith('+')) {
      return new NextResponse('Phone number must be in E.164 format (e.g., +1234567890)', { status: 400 });
    }

    // Generate unique room name
    const roomName = `outbound-call-${Math.floor(Math.random() * 10_000_000)}`;
    
    // Convert WebSocket URL (wss://) to HTTPS URL for API calls
    // LIVEKIT_URL is typically wss://subdomain.livekit.cloud
    // API calls need https://subdomain.livekit.cloud
    let baseUrl = LIVEKIT_URL;
    if (baseUrl.startsWith('wss://')) {
      baseUrl = baseUrl.replace('wss://', 'https://');
    } else if (baseUrl.startsWith('ws://')) {
      baseUrl = baseUrl.replace('ws://', 'http://');
    } else if (!baseUrl.startsWith('http')) {
      baseUrl = `https://${baseUrl}`;
    }
    
    // Create room service client
    const roomService = new RoomServiceClient(baseUrl, API_KEY, API_SECRET);
    
    // Create the room
    await roomService.createRoom({
      name: roomName,
      emptyTimeout: 10 * 60, // 10 minutes
      maxParticipants: 10,
    });

    // Verify trunk exists and get actual trunk ID for agent
    let trunkIdToUse = OUTBOUND_TRUNK_ID;
    const sipClient = new SipClient(baseUrl, API_KEY, API_SECRET);
    
    try {
      const availableTrunks = await sipClient.listSipOutboundTrunk();
      
      if (availableTrunks.length === 0) {
        throw new Error(`No outbound trunks found. LiveKit Phone Numbers only support inbound calls. For outbound calls, create an outbound SIP trunk:
        
Quick setup: Run 'python3 create-outbound-trunk.py' in the project root
Or: Go to https://cloud.livekit.io/projects/p_/telephony/config → Create new → Trunk → Outbound`);
      }
      
      // Check if the configured trunk ID exists
      const trunkExists = availableTrunks.some((trunk) => trunk.sipTrunkId === OUTBOUND_TRUNK_ID);
      
      if (!trunkExists) {
        // Use the first available outbound trunk
        trunkIdToUse = availableTrunks[0].sipTrunkId;
        console.warn(`Configured trunk ID ${OUTBOUND_TRUNK_ID} not found. Using first available trunk: ${trunkIdToUse}`);
        console.log('Available outbound trunks:', availableTrunks.map((t) => ({ id: t.sipTrunkId, name: t.name })));
      }
    } catch (trunkError: any) {
      console.error('Error listing outbound trunks:', trunkError.message);
      throw new Error(`Failed to verify outbound trunk: ${trunkError.message}`);
    }

    try {
      // Explicitly dispatch the agent using AgentDispatch API
      // This is more reliable than token-based dispatch for outbound calls
      const agentDispatchClient = new AgentDispatchClient(baseUrl, API_KEY, API_SECRET);
      
      const agentMetadata = JSON.stringify({
        ...(agentConfig || {}),
        phone_number: phoneNumber,
        outbound_trunk_id: trunkIdToUse,
      });
      
      console.log(`Explicitly dispatching agent ${AGENT_NAME} to room ${roomName}`);
      console.log(`Metadata: ${agentMetadata}`);
      
      const dispatch = await agentDispatchClient.createDispatch(
        roomName,
        AGENT_NAME,
        {
          metadata: agentMetadata,
        }
      );
      
      console.log(`✅ Agent dispatch created: ${dispatch.dispatchId}`);
      console.log(`Agent will create SIP participant after connecting to the room.`);

      // Create participant token for the web user (optional - if you want to monitor the call)
      // Note: We don't need agent dispatch in the token since we've already dispatched explicitly
      const participantIdentity = `web-user-${Math.floor(Math.random() * 10_000)}`;
      const participantToken = await createParticipantToken(
        {
          identity: participantIdentity,
          name: 'Web User',
        },
        roomName,
        undefined, // No agent dispatch in token - already dispatched explicitly
        undefined
      );

      // Return connection details (use original WebSocket URL for client)
      const data = {
        serverUrl: LIVEKIT_URL, // Keep original wss:// URL for client connection
        roomName,
        participantToken: participantToken,
        participantName: 'Web User',
        message: 'Agent dispatched. SIP participant will be created by the agent.',
        trunkId: trunkIdToUse,
      };

      const headers = new Headers({
        'Cache-Control': 'no-store',
      });
      return NextResponse.json(data, { headers });
    } catch (error: any) {
      console.error('Error setting up outbound call:', error);
      
      // Clean up room if setup fails
      try {
        await roomService.deleteRoom(roomName);
      } catch (deleteError) {
        console.error('Error deleting room:', deleteError);
      }

      return new NextResponse(
        `Failed to set up outbound call: ${error.message || 'Unknown error'}`,
        { status: 500 }
      );
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error(error);
      return new NextResponse(error.message, { status: 500 });
    }
    return new NextResponse('Internal server error', { status: 500 });
  }
}

function createParticipantToken(
  userInfo: AccessTokenOptions,
  roomName: string,
  agentName?: string,
  agentConfig?: any
): Promise<string> {
  const at = new AccessToken(API_KEY, API_SECRET, {
    ...userInfo,
    ttl: '15m',
  });
  const grant: VideoGrant = {
    room: roomName,
    roomJoin: true,
    canPublish: true,
    canPublishData: true,
    canSubscribe: true,
  };
  at.addGrant(grant);

  if (agentName) {
    at.roomConfig = new RoomConfiguration({
      agents: [{
        agentName,
        metadata: agentConfig ? JSON.stringify(agentConfig) : undefined,
      }],
    });
  }

  return at.toJwt();
}

