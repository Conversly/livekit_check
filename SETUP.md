# Setup Guide

This guide will help you set up and run the complete LiveKit voice AI system with a Next.js frontend and Python backend.

## Prerequisites

- Node.js 18+ and npm
- Python 3.11+ and uv (or pip)
- LiveKit Cloud account (or self-hosted LiveKit server)
- Environment variables for LiveKit (URL, API Key, API Secret)

## Quick Start

### 1. Backend Setup

```bash
cd agent-starter-python

# Install dependencies
uv sync

# Download required models
uv run python src/agent.py download-files

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your LiveKit credentials

# Run the agent
uv run python src/agent.py dev
```

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your LiveKit credentials:
# - NEXT_PUBLIC_LIVEKIT_URL (WebSocket URL, e.g., wss://your-project.livekit.cloud)
# - LIVEKIT_URL (HTTP URL, e.g., https://your-project.livekit.cloud)
# - LIVEKIT_API_KEY
# - LIVEKIT_API_SECRET

# Run the development server
npm run dev
```

### 3. Access the Application

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features

### ✅ Voice Interaction
- Real-time voice communication with AI agent
- Audio visualization
- Agent state monitoring (listening, thinking, speaking)

### ✅ Dynamic Configuration
- Change agent instructions in real-time
- Switch between different STT models
- Change LLM models
- Configure TTS models and voices
- Adjust language settings

### ✅ Modern UI
- Responsive design
- Dark mode support
- Real-time status indicators
- Configuration panel

## Project Structure

```
livekit/
├── agent-starter-python/    # Python backend agent
│   ├── src/
│   │   └── agent.py          # Main agent code (modified for dynamic config)
│   └── ...
├── frontend/                 # Next.js frontend
│   ├── app/
│   │   ├── api/
│   │   │   ├── token/        # Token generation endpoint
│   │   │   └── room-config/  # Room configuration endpoint
│   │   └── page.tsx          # Main page
│   ├── components/
│   │   ├── VoiceAssistant.tsx    # Main voice assistant component
│   │   └── AgentConfigPanel.tsx   # Configuration panel
│   └── ...
└── INTEGRATION.md            # Integration documentation
```

## Configuration

### Backend Configuration

The backend agent reads configuration from room metadata. Configuration includes:
- `instructions`: Agent behavior and personality
- `stt_model`: Speech-to-text model
- `stt_language`: STT language code
- `llm_model`: Language model
- `tts_model`: Text-to-speech model
- `tts_voice`: TTS voice ID
- `tts_language`: TTS language code

### Frontend Configuration

Users can configure all agent settings through the UI:
1. Click "Show" in the Configuration panel
2. Modify any settings
3. Click "Save Configuration"
4. Configuration applies to new agent sessions

## Troubleshooting

### Backend Issues

**Agent not starting:**
- Check environment variables in `.env.local`
- Ensure models are downloaded (`download-files` command)
- Check logs for errors

**Configuration not applying:**
- Verify room metadata is being set correctly
- Check backend logs for configuration parsing errors
- Ensure JSON format is correct

### Frontend Issues

**Cannot connect:**
- Verify environment variables are set correctly
- Check that `NEXT_PUBLIC_LIVEKIT_URL` uses `wss://` protocol
- Ensure backend agent is running

**No audio:**
- Check browser microphone permissions
- Verify audio tracks are being published/subscribed
- Check browser console for WebRTC errors

**Configuration not saving:**
- Check browser console for API errors
- Verify API routes are accessible
- Check network tab for failed requests

## Next Steps

1. Customize agent instructions for your use case
2. Add custom tools/functions to the agent
3. Integrate with your own data sources
4. Deploy to production (see backend README for deployment guide)

## Support

For more information:
- [LiveKit Agents Documentation](https://docs.livekit.io/agents)
- [LiveKit Client SDK Documentation](https://docs.livekit.io/home/client)
- [Integration Guide](./INTEGRATION.md)










