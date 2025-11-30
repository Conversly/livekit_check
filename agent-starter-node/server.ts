/**
 * Combined server: Agent + Token Server
 * Runs both the LiveKit agent and token generation API in one process
 */

import { AccessToken } from 'livekit-server-sdk';
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { spawn } from 'node:child_process';

dotenv.config({ path: '.env.local' });

const LIVEKIT_URL = process.env.LIVEKIT_URL || 'wss://verlyai-fjmbd34k.livekit.cloud';
const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY;
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET;

if (!LIVEKIT_API_KEY || !LIVEKIT_API_SECRET) {
  console.error('Missing LIVEKIT_API_KEY or LIVEKIT_API_SECRET in .env.local');
  process.exit(1);
}

// Create Express app for token server
const app = express();
app.use(cors());
app.use(express.json());

// Token generation endpoint
app.post('/token', async (req, res) => {
  try {
    const { roomName, participantName } = req.body;

    if (!roomName || !participantName) {
      return res.status(400).json({ error: 'roomName and participantName are required' });
    }

    const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
      identity: participantName,
      ttl: '10m',
    });

    at.addGrant({
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
    });

    const token = await at.toJwt();

    res.json({ token, url: LIVEKIT_URL });
  } catch (error: any) {
    console.error('Error generating token:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'combined-server' });
});

const TOKEN_SERVER_PORT = process.env.TOKEN_SERVER_PORT || 3001;

// Start token server
const server = app.listen(TOKEN_SERVER_PORT, () => {
  console.log(`🚀 Token server running on http://localhost:${TOKEN_SERVER_PORT}`);
  console.log(`📝 POST /token with { roomName, participantName }`);
  console.log(`🤖 Starting LiveKit agent...`);
});

server.on('error', (error: any) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${TOKEN_SERVER_PORT} is already in use!`);
    console.error(`💡 Kill the process using: lsof -ti:${TOKEN_SERVER_PORT} | xargs kill -9`);
    console.error(`💡 Or use a different port: TOKEN_SERVER_PORT=3002 pnpm run server`);
    process.exit(1);
  } else {
    console.error('Server error:', error);
    process.exit(1);
  }
});

// Start agent server in a child process
const agentProcess = spawn('pnpm', ['run', 'dev'], {
  stdio: 'inherit',
  shell: false,
  cwd: process.cwd(),
  env: {
    ...process.env, // Inherit all environment variables
  },
});

agentProcess.on('error', (error) => {
  console.error('❌ Failed to start agent:', error);
  process.exit(1);
});

agentProcess.on('exit', (code) => {
  if (code !== null && code !== 0) {
    console.log(`⚠️  Agent process exited with code ${code}`);
  }
});

// Handle graceful shutdown
const shutdown = () => {
  console.log('\n🛑 Shutting down...');
  agentProcess.kill('SIGINT');
  setTimeout(() => {
    agentProcess.kill('SIGTERM');
    process.exit(0);
  }, 5000);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

