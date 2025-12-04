import json
import logging

from dotenv import load_dotenv
from livekit import rtc
from livekit.agents import (
    Agent,
    AgentServer,
    AgentSession,
    JobContext,
    JobProcess,
    cli,
    inference,
    room_io,
)
from livekit.plugins import noise_cancellation, silero, google, deepgram
from livekit.plugins.turn_detector.multilingual import MultilingualModel

from livekit.plugins.google import beta as google_beta

logger = logging.getLogger("agent")

load_dotenv(".env")


class Assistant(Agent):
    def __init__(self, instructions: str = None) -> None:
        default_instructions = """You are Raghu, a helpful voice AI assistant. The user is interacting with you via voice, even if you perceive the conversation as text.
            You eagerly assist users with their questions by providing information from your extensive knowledge.
            Your responses are concise, to the point, and without any complex formatting or punctuation including emojis, asterisks, or other symbols.
            You are curious, friendly, and have a sense of humor."""
        
        super().__init__(
            instructions=instructions or default_instructions,
        )

    # To add tools, use the @function_tool decorator.
    # Here's an example that adds a simple weather tool.
    # You also have to add `from livekit.agents import function_tool, RunContext` to the top of this file
    # @function_tool
    # async def lookup_weather(self, context: RunContext, location: str):
    #     """Use this tool to look up current weather information in the given location.
    #
    #     If the location is not supported by the weather service, the tool will indicate this. You must tell the user the location's weather is unavailable.
    #
    #     Args:
    #         location: The location to look up weather information for (e.g. city name)
    #     """
    #
    #     logger.info(f"Looking up weather for {location}")
    #
    #     return "sunny with a temperature of 70 degrees."

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
    # Add any other context you want in all log entries here
    ctx.log_context_fields = {
        "room": ctx.room.name,
    }

    # Read configuration from room metadata or job metadata
    config = {}
    try:
        if ctx.room.metadata:
            config = json.loads(ctx.room.metadata)
        elif ctx.job.metadata:
            config = json.loads(ctx.job.metadata)
    except (json.JSONDecodeError, AttributeError):
        logger.warning("Failed to parse metadata, using defaults")
        config = {}

    # Extract configuration with defaults
    agent_instructions = config.get("instructions", None)
    stt_model = config.get("stt_model", "deepgram/nova-2")
    stt_language = config.get("stt_language", "hi")
    llm_model = config.get("llm_model", "google/gemini-2.5-flash-lite")
    tts_model = config.get("tts_model", "elevenlabs/eleven_multilingual_v2")
    tts_voice = config.get("tts_voice", "TX3LPaxmHKxFdv7VOQHJ")
    tts_language = config.get("tts_language", "hi")

    logger.info(f"Agent configuration: STT={stt_model}, LLM={llm_model}, TTS={tts_model}")

    # Set up a voice AI pipeline with dynamic configuration
    session = AgentSession(
        stt=inference.STT(model=stt_model, language=stt_language),
        llm=inference.LLM(model=llm_model),
        tts=inference.TTS(
            model=tts_model,
            voice=tts_voice,
            language=tts_language
        ),
        turn_detection=MultilingualModel(),
        vad=ctx.proc.userdata["vad"],
        preemptive_generation=True,
    )

    # To use a realtime model instead of a voice pipeline, use the following session setup instead.
    # (Note: This is for the OpenAI Realtime API. For other providers, see https://docs.livekit.io/agents/models/realtime/))
    # 1. Install livekit-agents[openai]
    # 2. Set OPENAI_API_KEY in .env.local
    # 3. Add `from livekit.plugins import openai` to the top of this file
    # 4. Use the following session setup instead of the version above
    # session = AgentSession(
    #     llm=openai.realtime.RealtimeModel(voice="marin")
    # )

    # # Add a virtual avatar to the session, if desired
    # # For other providers, see https://docs.livekit.io/agents/models/avatar/
    # avatar = hedra.AvatarSession(
    #   avatar_id="...",  # See https://docs.livekit.io/agents/models/avatar/plugins/hedra
    # )
    # # Start the avatar and wait for it to join
    # await avatar.start(session, room=ctx.room)

    # Start the session, which initializes the voice pipeline and warms up the models
    await session.start(
        agent=Assistant(instructions=agent_instructions),
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
