import {
  type JobContext,
  type JobProcess,
  ServerOptions,
  cli,
  defineAgent,
  inference,
  metrics,
  voice,
} from '@livekit/agents';

import * as livekit from '@livekit/agents-plugin-livekit';
import * as silero from '@livekit/agents-plugin-silero';
import {
  BackgroundVoiceCancellation,
  TelephonyBackgroundVoiceCancellation,
} from '@livekit/noise-cancellation-node';

import { ParticipantKind } from '@livekit/rtc-node';
import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';

// Resolve .env.local path relative to this file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '../.env.local') });

// Gemini + ElevenLabs imports
import * as google from '@livekit/agents-plugin-google';
import * as elevenlabs from '@livekit/agents-plugin-elevenlabs';

class DefaultAgent extends voice.Agent {
  constructor() {
    super({
      instructions: `You are a friendly, reliable voice assistant that answers questions clearly and politely.`,
    });
  }

  override async onEnter(): Promise<void> {
    try {
      await this.session.generateReply({
        instructions: 'Greet the user and offer your assistance.',
        allowInterruptions: true,
      });
    } catch (error) {
      console.error('Error in onEnter (greeting):', error);
      try {
        await this.session.say('Hello! How can I help you today?', {
          allowInterruptions: true,
        });
      } catch (fallbackError) {
        console.error('Error in fallback greeting:', fallbackError);
      }
    }
  }
}

export default defineAgent({
  prewarm: async (proc: JobProcess) => {
    proc.userData.vad = await silero.VAD.load();
  },

  entry: async (ctx: JobContext) => {
    const session = new voice.AgentSession({
      // ------------------------ STT ------------------------
      stt: new inference.STT({
        model: 'cartesia/whisper',
        language: 'en',
      }),

      // ------------------------ LLM ------------------------
      llm: new google.LLM({
        apiKey: process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY!,
        model: 'gemini-2.5-flash-lite',
      }),

      // ------------------------ TTS ------------------------
      tts: new elevenlabs.TTS({
        apiKey: process.env.ELEVENLABS_API_KEY!,
        modelID: 'eleven_turbo_v2_5',
        voice: {
          id: 'Xb7hH8MSUJpSbSDYk0k2',
          name: 'Voice',
          category: 'premade',
        },
      }),

      turnDetection: new livekit.turnDetector.MultilingualModel(),
      vad: ctx.proc.userData.vad! as silero.VAD,
      voiceOptions: {
        preemptiveGeneration: true,
        minEndpointingDelay: 200,
        maxEndpointingDelay: 3000,
        minInterruptionDuration: 300,
      },
    });

    // ------------------------ Metrics ------------------------
    const usageCollector = new metrics.UsageCollector();

    session.on(voice.AgentSessionEventTypes.MetricsCollected, (ev) => {
      metrics.logMetrics(ev.metrics);
      usageCollector.collect(ev.metrics);
    });

    // ------------------------ Error Handling ------------------------
    session.on(voice.AgentSessionEventTypes.Error, (ev) => {
      const { error, source } = ev;
      const sourceName = source?.constructor?.name || 'Unknown';

      let errorMessage = 'Unknown error';
      if (error) {
        if (typeof error === 'string') errorMessage = error;
        else if (typeof error === 'object' && 'message' in error)
          errorMessage = String(error.message);
      }

      const recoverable =
        error && typeof error === 'object' && ('recoverable' in error || 'retryable' in error)
          ? (error as any).recoverable ?? (error as any).retryable
          : true;

      if (recoverable) {
        console.warn(`[${sourceName}] Recoverable error:`, errorMessage);
      } else {
        console.error(`[${sourceName}] Unrecoverable error:`, errorMessage);
        try {
          session.say('I encountered an error. Please try again.', {
            allowInterruptions: true,
          });
        } catch (err) {
          console.warn('Failed to notify user of error:', err);
        }
      }
    });

    session.on(voice.AgentSessionEventTypes.Close, (ev) => {
      if (ev.error) console.error('Session closed with error:', ev.error);
      else console.log('Session closed normally');
    });

    ctx.addShutdownCallback(async () => {
      const summary = usageCollector.getSummary();
      console.log(`Usage: ${JSON.stringify(summary)}`);
    });

    const hasSipParticipant = Array.from(ctx.room.remoteParticipants.values()).some(
      (p) => p.kind === ParticipantKind.SIP,
    );

    // ------------------------ Start Session ------------------------
    try {
      await session.start({
        agent: new DefaultAgent(),
        room: ctx.room,
        inputOptions: {
          noiseCancellation: hasSipParticipant
            ? TelephonyBackgroundVoiceCancellation()
            : BackgroundVoiceCancellation(),
        },
      });
      console.log('Agent session started successfully');
    } catch (error) {
      console.error('Failed to start agent session:', error);
      throw error;
    }

    try {
      await ctx.connect();
      console.log('Agent connected to room successfully');
    } catch (error) {
      console.error('Failed to connect to room:', error);
      throw error;
    }
  },
});

// ------------------------ Global Error Handling ------------------------
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

// ------------------------ Run CLI ------------------------
cli.runApp(new ServerOptions({ agent: fileURLToPath(import.meta.url) }));
