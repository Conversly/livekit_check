#!/usr/bin/env node

/**
 * Simple token server for LiveKit frontend
 * Run with: node token-server.js
 */

import { AccessToken } from 'livekit-server-sdk';
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';

dotenv.config({ path: '.env.local' });

const app = express();
app.use(cors());
app.use(express.json());

const LIVEKIT_URL = process.env.LIVEKIT_URL || 'wss://verlyai-fjmbd34k.livekit.cloud';
const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY;
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET;

if (!LIVEKIT_API_KEY || !LIVEKIT_API_SECRET) {
  console.error('Missing LIVEKIT_API_KEY or LIVEKIT_API_SECRET in .env.local');
  process.exit(1);
}

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
  } catch (error) {
    console.error('Error generating token:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Token server running on http://localhost:${PORT}`);
  console.log(`📝 POST /token with { roomName, participantName }`);
});

