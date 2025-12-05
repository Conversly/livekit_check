import json
import logging
import os

from dotenv import load_dotenv
from livekit import rtc
from livekit.agents import (
    Agent,
    AgentServer,
    AgentSession,
    JobContext,
    JobProcess,
    cli,
    room_io,
)
from livekit.plugins import noise_cancellation, silero, google, assemblyai, elevenlabs
from livekit.plugins.turn_detector.multilingual import MultilingualModel

logger = logging.getLogger("agent")

# Load environment variables from .env file
load_dotenv()


class Assistant(Agent):
    def __init__(self, instructions: str) -> None:
        super().__init__(
            instructions=instructions,
        )

    async def on_enter(self):
        await self.session.generate_reply(
            instructions="""Greet the user and offer your assistance.""",
            allow_interruptions=True,
        )


server = AgentServer()


def prewarm(proc: JobProcess):
    proc.userdata["vad"] = silero.VAD.load()


server.setup_fnc = prewarm


@server.rtc_session()
async def my_agent(ctx: JobContext):
    # Logging setup
    ctx.log_context_fields = {
        "room": ctx.room.name,
    }

    logger.info("=" * 50)
    logger.info("Agent starting - reading configuration")
    logger.info(f"Room name: {ctx.room.name}")
    
    # Read configuration from job metadata, room metadata, or participant metadata
    config = {}
    try:
        logger.info(f"Job metadata raw: {ctx.job.metadata}")
        if ctx.job.metadata:
            config = json.loads(ctx.job.metadata)
            logger.info(f"Parsed job metadata config: {json.dumps(config, indent=2)}")
        else:
            logger.info("No job metadata found")
            
        if not config:
            logger.info(f"Room metadata raw: {ctx.room.metadata}")
            if ctx.room.metadata:
                config = json.loads(ctx.room.metadata)
                logger.info(f"Parsed room metadata config: {json.dumps(config, indent=2)}")
            else:
                logger.info("No room metadata found")
                
    except (json.JSONDecodeError, AttributeError) as e:
        logger.warning(f"Failed to parse metadata: {e}, using defaults")
        config = {}

    # Extract configuration with defaults
    instructions = config.get("instructions", """You are a helpful voice AI assistant. The user is interacting with you via voice, even if you perceive the conversation as text.
            You eagerly assist users with their questions by providing information from your extensive knowledge.
            Your responses are concise, to the point, and without any complex formatting or punctuation including emojis, asterisks, or other symbols.
            You are curious, friendly, and have a sense of humor.""")
    
    # STT configuration - using AssemblyAI (hardcoded)
    stt_language = config.get("stt_language", "en")
    
    # LLM configuration - using Google Gemini 2.5 Flash Lite (hardcoded)
    llm_model = "gemini-2.5-flash-lite"
    
    # TTS configuration - using ElevenLabs Multilingual v2 (hardcoded)
    tts_voice = config.get("tts_voice", "21m00Tcm4TlvDq8ikWAM")  # Rachel (default)
    tts_model = "eleven_multilingual_v2"
    tts_language = config.get("tts_language", "en")

    logger.info("=" * 50)
    logger.info("Final Agent Configuration:")
    logger.info(f"  STT: AssemblyAI (lang={stt_language})")
    logger.info(f"  LLM: Google Gemini ({llm_model})")
    logger.info(f"  TTS: ElevenLabs Multilingual v2 (voice={tts_voice}, lang={tts_language})")
    logger.info(f"  Instructions: {instructions[:100]}...")
    logger.info("=" * 50)

    # Initialize providers with hardcoded models
    # STT - using AssemblyAI (auto-detects language)
    stt = assemblyai.STT()
    
    # LLM - using Google Gemini
    llm = google.LLM(
        model=llm_model,
    )
    
    # TTS - using ElevenLabs
    tts = elevenlabs.TTS(
        voice_id=tts_voice,
    )

    # Set up a voice AI pipeline
    session = AgentSession(
        stt=stt,
        llm=llm,
        tts=tts,
        turn_detection=MultilingualModel(),
        vad=ctx.proc.userdata["vad"],
    )

    # Start the session
    await session.start(
        agent=Assistant(instructions=instructions),
        room=ctx.room,
        room_options=room_io.RoomOptions(
            audio_input=room_io.AudioInputOptions(
                noise_cancellation=lambda params: noise_cancellation.BVCTelephony()
                if params.participant.kind == rtc.ParticipantKind.PARTICIPANT_KIND_SIP
                else noise_cancellation.BVC(),
            ),
        ),
    )

    # Join the room and connect to the user
    await ctx.connect()


if __name__ == "__main__":
    cli.run_app(server)

