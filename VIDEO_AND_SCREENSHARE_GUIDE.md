# Video and Screen Sharing Guide

## Current Status ✅

Your LiveKit system **already supports video and screen sharing**! The infrastructure is in place:

- ✅ Frontend components are built and ready
- ✅ App configuration enables video by default
- ✅ Token generation allows publishing
- ✅ UI controls are available in the control bar

## What's Already Configured

### 1. App Configuration (`agent-starter-react/app-config.ts`)
```typescript
supportsVideoInput: true,      // Camera support
supportsScreenShare: true,     // Screen sharing support
```

### 2. Token Permissions (`agent-starter-react/app/api/connection-details/route.ts`)
The token generation already includes:
```typescript
canPublish: true,  // Allows publishing all track types
```

### 3. Frontend Components
- Camera toggle button in control bar
- Screen share toggle button in control bar
- Video track rendering in tile layout
- Device selection dropdowns

## How to Use Video and Screen Sharing

### For Users:
1. **Start a call** - Click "Start call" button
2. **Enable Camera** - Click the camera icon in the control bar
   - Browser will prompt for camera permission
   - Select your camera device from the dropdown if needed
3. **Enable Screen Share** - Click the screen share icon
   - Browser will prompt to select what to share (screen, window, or tab)
   - Note: Screen share automatically disables camera when enabled

### Video Display:
- Your camera/screen share appears in a tile next to the agent
- The video tile is visible when chat is open or closed
- Screen share takes priority over camera when both are enabled

## Verification Checklist

If video/screen sharing isn't working, check:

### 1. Browser Permissions
- Ensure your browser allows camera/microphone access
- Check browser settings for site permissions
- Try in an incognito/private window if permissions seem stuck

### 2. HTTPS Requirement
- Video/screen sharing requires HTTPS (or localhost)
- Ensure you're accessing via `https://` or `http://localhost`

### 3. App Config Check
Verify in `agent-starter-react/app-config.ts`:
```typescript
supportsVideoInput: true,
supportsScreenShare: true,
```

### 4. Token Permissions
Verify in `agent-starter-react/app/api/connection-details/route.ts`:
```typescript
const grant: VideoGrant = {
  room: roomName,
  roomJoin: true,
  canPublish: true,  // Must be true
  canPublishData: true,
  canSubscribe: true,
};
```

## Optional Enhancements

### 1. Explicit Source Permissions (if needed)
If you want to restrict which sources can be published, you can modify the token generation:

```typescript
// In route.ts, modify the grant:
const grant: VideoGrant = {
  room: roomName,
  roomJoin: true,
  canPublish: true,
  canPublishSources: ['CAMERA', 'SCREEN_SHARE', 'MICROPHONE'], // Explicit sources
  canPublishData: true,
  canSubscribe: true,
};
```

### 2. Agent Video Processing (Advanced)
If you want your agent to process video frames (e.g., vision capabilities):

1. Update agent to use a model with vision support (e.g., Gemini Live)
2. Enable video input in agent session:
```typescript
// In agent.ts
await session.start({
  agent: new DefaultAgent(),
  room: ctx.room,
  inputOptions: {
    videoEnabled: true,  // Enable video input for agent
  },
});
```

See LiveKit docs: https://docs.livekit.io/agents/build/vision/

### 3. Custom Video Constraints
You can customize video quality in the frontend by modifying track creation settings.

## Troubleshooting

### Camera button doesn't appear
- Check `appConfig.supportsVideoInput` is `true`
- Verify `publishPermissions.camera` is `true` (check browser console)

### Screen share button doesn't appear
- Check `appConfig.supportsScreenShare` is `true`
- Verify `publishPermissions.screenShare` is `true`

### Video doesn't display
- Check browser console for errors
- Verify track is published: `localParticipant.getTrackPublication(Track.Source.Camera)`
- Check network tab for WebRTC connection issues

### Permission denied errors
- Clear browser permissions for your site
- Ensure HTTPS is enabled
- Check browser console for specific error messages

## Testing

1. **Test Camera:**
   - Start a call
   - Click camera icon
   - Grant permission
   - Verify video appears in tile

2. **Test Screen Share:**
   - Start a call
   - Click screen share icon
   - Select screen/window/tab
   - Verify screen share appears in tile

3. **Test Switching:**
   - Enable camera
   - Enable screen share (should disable camera)
   - Disable screen share (camera can be re-enabled)

## Summary

Your system is **already configured** for video and screen sharing! The controls should appear in the UI when you start a call. If they don't appear or don't work:

1. Verify app config settings
2. Check browser permissions
3. Ensure HTTPS is enabled
4. Check browser console for errors

The agent itself doesn't need changes for basic video support - users can publish video tracks that the agent can subscribe to if needed.


