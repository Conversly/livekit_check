import asyncio
import json
import logging
import os

from dotenv import load_dotenv
from livekit import api, rtc
from livekit.agents import (
    Agent,
    AgentServer,
    AgentSession,
    JobContext,
    JobProcess,
    cli,
    room_io,
)
from livekit.plugins import noise_cancellation, silero, google, assemblyai
from livekit.plugins.turn_detector.multilingual import MultilingualModel

logger = logging.getLogger("agent")

# Load environment variables from .env file
load_dotenv()


class Assistant(Agent):
    def __init__(self, instructions: str, is_outbound_call: bool = False) -> None:
        super().__init__(
            instructions=instructions,
        )
        self.is_outbound_call = is_outbound_call
        self._has_greeted = False

    async def on_enter(self):
        # Only greet automatically for inbound calls
        # For outbound calls, wait for the recipient to speak first
        if not self.is_outbound_call and not self._has_greeted:
            self._has_greeted = True
            # Wait a moment for audio to be ready
            await asyncio.sleep(0.5)
            await self.session.generate_reply(
                instructions="""Greet the user and offer your assistance.""",
                allow_interruptions=True,
            )


server = AgentServer()


def prewarm(proc: JobProcess):
    proc.userdata["vad"] = silero.VAD.load()


server.setup_fnc = prewarm


@server.rtc_session(agent_name="my-telephony-agent")
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

    # Check if this is an outbound call
    phone_number = config.get("phone_number")
    is_outbound_call = phone_number is not None
    
    # Get outbound trunk ID from config or environment
    outbound_trunk_id = config.get("outbound_trunk_id") or os.getenv("LIVEKIT_OUTBOUND_TRUNK_ID")
    
    # Optional outbound call settings
    krisp_enabled = config.get("krisp_enabled", True)  # Noise cancellation
    play_dialtone = config.get("play_dialtone", False)  # Play dial tone while connecting
    display_name = config.get("display_name")  # Custom caller ID (optional)
    dtmf = config.get("dtmf")  # DTMF tones for extension codes (optional)
    
    # Extract configuration with defaults
    instructions = config.get("instructions", """You are a helpful voice AI assistant. The user is interacting with you via voice, even if you perceive the conversation as text.
            You eagerly assist users with their questions by providing information from your extensive knowledge.
            Your responses are concise, to the point, and without any complex formatting or punctuation including emojis, asterisks, or other symbols.
            You are curious, friendly, and have a sense of humor.""")
    
    # STT configuration - using AssemblyAI (hardcoded)
    stt_language = config.get("stt_language", "en")
    
    # LLM configuration - using Google Gemini 2.5 Flash Lite (hardcoded)
    llm_model = "gemini-2.5-flash-lite"
    
    # TTS configuration - using Google Gemini TTS (free tier)
    # Valid Google Gemini TTS voices (all lowercase)
    VALID_GEMINI_VOICES = {
        "achernar", "achird", "algenib", "algieba", "alnilam", "aoede", 
        "autonoe", "callirrhoe", "charon", "despina", "enceladus", "erinome", 
        "fenrir", "gacrux", "iapetus", "kore", "laomedeia", "leda", "orus", 
        "puck", "pulcherrima", "rasalgethi", "sadachbia", "sadaltager", 
        "schedar", "sulafat", "umbriel", "vindemiatrix", "zephyr", "zubenelgenubi"
    }
    
    tts_voice_raw = config.get("tts_voice", "zephyr")
    # Normalize to lowercase and validate
    tts_voice = tts_voice_raw.lower().strip() if tts_voice_raw else "zephyr"
    if tts_voice not in VALID_GEMINI_VOICES:
        logger.warning(f"Invalid voice name '{tts_voice_raw}', falling back to 'zephyr'")
        tts_voice = "zephyr"
    
    tts_language = config.get("tts_language", "en")

    logger.info("=" * 50)
    logger.info("Final Agent Configuration:")
    logger.info(f"  Call Type: {'Outbound' if is_outbound_call else 'Inbound/Web'}")
    if is_outbound_call:
        logger.info(f"  Phone Number: {phone_number}")
    logger.info(f"  STT: AssemblyAI (lang={stt_language})")
    logger.info(f"  LLM: Google Gemini ({llm_model})")
    logger.info(f"  TTS: Google Gemini TTS (voice={tts_voice}, lang={tts_language})")
    logger.info(f"  Instructions: {instructions[:100]}...")
    logger.info("=" * 50)

    # Initialize providers with hardcoded models
    # STT - using AssemblyAI (auto-detects language)
    stt = assemblyai.STT()
    
    # LLM - using Google Gemini
    llm = google.LLM(
        model=llm_model,
    )
    
    # TTS - using Google Gemini TTS (free tier)
    tts = google.beta.GeminiTTS(
        model="gemini-2.5-flash-preview-tts",
        voice_name=tts_voice,
        instructions="Speak in a friendly and engaging tone.",
    )

    # If this is an outbound call, create SIP participant BEFORE starting session
    # According to LiveKit docs: https://docs.livekit.io/frontends/telephony/agents/#dialing
    if is_outbound_call and phone_number:
        logger.info("=" * 50)
        logger.info("OUTBOUND CALL DETECTED")
        logger.info(f"Phone Number: {phone_number}")
        logger.info(f"Outbound Trunk ID: {outbound_trunk_id}")
        logger.info("=" * 50)
        
        if not outbound_trunk_id:
            logger.error("❌ Outbound trunk ID not found. Cannot make outbound call.")
            logger.error("Please set LIVEKIT_OUTBOUND_TRUNK_ID environment variable or include it in agent config.")
            logger.error("You can also let the frontend API create the SIP participant.")
        else:
            try:
                # Wait a moment for room to be fully ready
                await asyncio.sleep(1)
                
                logger.info(f"📞 Creating SIP participant for outbound call to {phone_number}")
                logger.info(f"Using trunk ID: {outbound_trunk_id}")
                
                # Create SIP participant - this will initiate the outbound call
                # Build request with required and optional parameters
                request_params = {
                    # Required parameters
                    "room_name": ctx.room.name,
                    "sip_trunk_id": outbound_trunk_id,
                    "sip_call_to": phone_number,
                    "participant_identity": phone_number,
                    "participant_name": phone_number,
                    "wait_until_answered": True,
                    # Optional parameters
                    "krisp_enabled": krisp_enabled,
                    "play_dialtone": play_dialtone,
                }
                
                # Add optional display_name if provided (custom caller ID)
                if display_name:
                    request_params["display_name"] = display_name
                
                # Add optional DTMF if provided (for extension codes)
                if dtmf:
                    request_params["dtmf"] = dtmf
                
                logger.info(f"Request parameters: {json.dumps(request_params, indent=2)}")
                
                result = await ctx.api.sip.create_sip_participant(
                    api.CreateSIPParticipantRequest(**request_params)
                )
                logger.info("✅ SIP participant created successfully!")
                logger.info(f"Call initiated to {phone_number}")
                logger.info(f"SIP participant details: {result}")
            except api.TwirpError as e:
                logger.error("❌ Error creating SIP participant (TwirpError):")
                logger.error(f"  Message: {e.message}")
                logger.error(f"  Code: {e.code}")
                if e.metadata:
                    logger.error(f"  Metadata: {e.metadata}")
                    logger.error(f"  SIP status code: {e.metadata.get('sip_status_code')}")
                    logger.error(f"  SIP status: {e.metadata.get('sip_status')}")
                logger.error("This might be due to:")
                logger.error("  1. Invalid trunk ID")
                logger.error("  2. Twilio authentication issues")
                logger.error("  3. Invalid phone number format")
                logger.error("  4. Twilio account restrictions")
                # Don't shutdown - let the agent continue in case frontend creates the participant
                logger.warning("Continuing anyway - frontend may create SIP participant")
            except Exception as e:
                logger.error(f"❌ Unexpected error creating SIP participant: {type(e).__name__}")
                logger.error(f"  Error: {str(e)}")
                import traceback
                logger.error(f"  Traceback: {traceback.format_exc()}")
                logger.warning("Continuing anyway - frontend may create SIP participant")

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
        agent=Assistant(instructions=instructions, is_outbound_call=is_outbound_call),
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
    logger.info("Agent connected to room successfully")
    logger.info("Agent ready for voice interaction")


if __name__ == "__main__":
    cli.run_app(server)

