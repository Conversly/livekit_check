## Dev Setup
```console
cd agent-starter-python
uv sync
```
lk cloud auth
lk app env -w -d .env.local
      or 
- `LIVEKIT_URL`
- `LIVEKIT_API_KEY`
- `LIVEKIT_API_SECRET`

## Run the agent

```console
uv run python src/agent.py download-files
```

Next, run this command to speak to your agent directly in your terminal:
```console
uv run python src/agent.py console
```

To run the agent for use with a frontend or telephony, use the `dev` command:
```console
uv run python src/agent.py dev
```

In production, use the `start` command:

```console
uv run python src/agent.py start
```

## frontend

```console
cd frontend-livekit
pnpm dev
```

## Verify Telephony Setup

To check your LiveKit telephony configuration (trunks, dispatch rules):

**Option 1: Using the verification endpoint**
```console
# Make sure your Next.js server is running, then:
curl http://localhost:3000/api/verify-telephony | jq .
```

**Option 2: Using the verification script**
```console
./verify-setup.sh
```

**Option 3: Check LiveKit Cloud Dashboard**
Visit: https://cloud.livekit.io/projects/p_/telephony/config

## Phone Call Setup

Make sure you have:
1. ✅ At least one **outbound trunk** configured
2. ✅ A **dispatch rule** that routes calls to your agent
3. ✅ Environment variable `LIVEKIT_OUTBOUND_TRUNK_ID` set (or let the code auto-detect)

### Create Outbound Trunk

**If you have no outbound trunks** (check with `lk sip outbound list`):

**Quick method:**
```bash
./create-outbound-trunk.sh
```

**Manual method:**
```bash
# Create outbound-trunk.json (see create-outbound-trunk-example.json)
lk sip outbound create outbound-trunk.json
```

See [CREATE_TRUNK_CLI.md](./CREATE_TRUNK_CLI.md) for detailed instructions.

### Documentation

- [QUICK_FIX.md](./QUICK_FIX.md) - Quick setup guide
- [CREATE_TRUNK_CLI.md](./CREATE_TRUNK_CLI.md) - Create trunk using CLI
- [SETUP_OUTBOUND_TRUNK.md](./SETUP_OUTBOUND_TRUNK.md) - Detailed trunk setup
- [TELEPHONY_SETUP.md](./TELEPHONY_SETUP.md) - Complete telephony setup