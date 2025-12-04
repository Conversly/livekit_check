# Integration Guide

This document explains how the frontend and backend work together to provide a configurable voice AI assistant.

## Architecture Overview

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Frontend  │────────▶│  LiveKit     │────────▶│   Backend   │
│  (Next.js)  │         │   Server     │         │   (Python)  │
└─────────────┘         └──────────────┘         └─────────────┘
      │                        │                        │
      │ 1. Generate Token      │                        │
      │───────────────────────▶│                        │
      │                        │                        │
      │ 2. Update Room Config  │                        │
      │───────────────────────▶│                        │
      │                        │                        │
      │ 3. Connect to Room     │                        │
      │───────────────────────▶│                        │
      │                        │ 4. Dispatch Agent      │
      │                        │───────────────────────▶│
      │                        │                        │
      │                        │ 5. Agent Reads Config │
      │                        │◀───────────────────────│
      │                        │                        │
      │ 6. Voice Communication │                        │
      │◀───────────────────────┼───────────────────────▶│
```

## Flow

1. **Frontend generates token**: The frontend calls `/api/token` to get a LiveKit access token
2. **Frontend sets room configuration**: Before connecting, the frontend calls `/api/room-config` to set the agent configuration in room metadata
3. **Frontend connects**: The frontend connects to the LiveKit room using the token
4. **Agent dispatched**: LiveKit automatically dispatches the agent when a participant joins
5. **Agent reads configuration**: The agent reads the configuration from room metadata and applies it
6. **Voice communication**: Real-time voice communication happens via WebRTC

## Configuration

### Backend Configuration

The backend agent reads configuration from room metadata in this order:
1. `ctx.room.metadata` (set via UpdateRoomMetadata API)
2. `ctx.job.metadata` (set when dispatching the agent)
3. Default values

### Frontend Configuration

The frontend allows users to configure:
- **Instructions**: Agent behavior and personality
- **STT Model**: Speech-to-text model (e.g., `deepgram/nova-2`)
- **STT Language**: Language code (e.g., `hi`, `en`)
- **LLM Model**: Language model (e.g., `google/gemini-2.5-flash-lite`)
- **TTS Model**: Text-to-speech model (e.g., `elevenlabs/eleven_multilingual_v2`)
- **TTS Voice**: Voice ID for TTS provider
- **TTS Language**: Language code for TTS

## Environment Variables

### Frontend (.env.local)

```env
NEXT_PUBLIC_LIVEKIT_URL=wss://your-project.livekit.cloud
LIVEKIT_URL=https://your-project.livekit.cloud
LIVEKIT_API_KEY=your-api-key
LIVEKIT_API_SECRET=your-api-secret
```

### Backend (.env)

```env
LIVEKIT_URL=https://your-project.livekit.cloud
LIVEKIT_API_KEY=your-api-key
LIVEKIT_API_SECRET=your-api-secret
```

## Running the Application

### 1. Start the Backend Agent

```bash
cd agent-starter-python
uv sync
uv run python src/agent.py dev
```

### 2. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

### 3. Access the Application

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Important Notes

1. **Configuration Timing**: Room metadata should be set before the agent connects. The frontend sets it before generating the token.

2. **Configuration Changes**: Changes to configuration apply to new agent sessions. Existing sessions continue with their original configuration.

3. **Room Metadata Size**: Room metadata is limited to 64 KiB. Keep instructions concise if you have very long prompts.

4. **Agent Restart**: To apply configuration changes to an existing session, you may need to disconnect and reconnect, or restart the agent.

5. **Browser Permissions**: The frontend requires microphone permissions for voice interaction.

## Troubleshooting

### Agent not connecting
- Check that the backend agent is running
- Verify environment variables are set correctly
- Check browser console for connection errors

### Configuration not applying
- Ensure room metadata is set before agent connects
- Check backend logs for configuration parsing errors
- Verify JSON format in room metadata

### Audio issues
- Check browser microphone permissions
- Verify audio tracks are being published/subscribed
- Check browser console for WebRTC errors

