# Camera Testing Guide

## Quick Test Steps

### 1. Start the Backend Agent

```bash
cd agent-starter-node
pnpm run server
```

**What to look for:**
- ✅ Token server running on `http://localhost:3001`
- ✅ Agent starting up
- ✅ No errors in console

### 2. Start the Frontend

```bash
cd agent-starter-react
pnpm run dev
```

**What to look for:**
- ✅ Server running on `http://localhost:3000`
- ✅ No build errors

### 3. Open Browser and Test

1. **Open:** `http://localhost:3000`
2. **Click:** "Start call" button
3. **Allow permissions:** Browser will prompt for camera/microphone access
   - Click "Allow" for both camera and microphone
4. **Look for camera button:** In the control bar at the bottom
5. **Click camera icon:** Should enable your camera
6. **Check video tile:** Your camera feed should appear in the video tile (next to agent)

## What to Verify

### ✅ Frontend Checks

1. **Camera Button Appears**
   - Look in the control bar at the bottom
   - Should see a camera icon button
   - If missing, check browser console for errors

2. **Browser Permission Prompt**
   - When you click camera button, browser should ask for permission
   - Select your camera device from the dropdown
   - If no prompt, check browser settings

3. **Video Tile Shows Your Camera**
   - Small video tile appears next to the agent
   - Shows your live camera feed
   - Updates in real-time

4. **Browser Console (F12)**
   - Open DevTools → Console tab
   - Should see: `Track published: camera` or similar
   - No permission errors
   - No WebRTC errors

### ✅ Backend Checks

**In the backend terminal, you should see:**

```
Video track subscribed: Camera from voice_assistant_user_XXXX
```

**If you see this message:**
- ✅ Camera is working!
- ✅ Backend is receiving video frames
- ✅ Video stream is connected

**If you DON'T see this message:**
- Check if camera button was actually clicked
- Check browser console for errors
- Verify camera permissions were granted

## Detailed Testing Checklist

### Step-by-Step Test

- [ ] **Backend running** - `pnpm run server` in agent-starter-node
- [ ] **Frontend running** - `pnpm run dev` in agent-starter-react  
- [ ] **Browser opened** - http://localhost:3000
- [ ] **Started call** - Clicked "Start call" button
- [ ] **Permissions granted** - Allowed camera and microphone
- [ ] **Camera button visible** - See camera icon in control bar
- [ ] **Camera enabled** - Clicked camera button
- [ ] **Video appears** - See your camera feed in the tile
- [ ] **Backend log shows** - "Video track subscribed: Camera"
- [ ] **No console errors** - Browser DevTools shows no errors

## Browser Console Checks

Open DevTools (F12) → Console tab and look for:

**Good signs:**
```
✅ Track published: camera
✅ Camera track enabled
✅ Video track dimensions: 640x480 (or similar)
```

**Bad signs:**
```
❌ NotAllowedError: Permission denied
❌ NotFoundError: No camera found
❌ OverconstrainedError: Camera constraints not met
```

## Common Issues & Fixes

### Issue: Camera Button Doesn't Appear

**Check:**
1. `app-config.ts` has `supportsVideoInput: true`
2. Browser console for errors
3. Token permissions include camera

**Fix:**
- Verify `app-config.ts` configuration
- Check browser console for specific errors

### Issue: Permission Denied

**Check:**
1. Browser settings → Site permissions → Camera
2. URL is `localhost` or `https://` (required for camera)
3. Browser isn't blocking permissions

**Fix:**
- Clear site permissions and try again
- Use `localhost` or enable HTTPS
- Check browser privacy settings

### Issue: No Video in Tile

**Check:**
1. Camera button is actually enabled (highlighted/pressed)
2. Browser console for track publication errors
3. Video tile is visible (might be hidden if chat is open)

**Fix:**
- Toggle camera off and on again
- Check browser console for errors
- Try closing chat to see video tile

### Issue: Backend Not Receiving Video

**Check:**
1. Backend terminal for "Video track subscribed" message
2. Browser console shows track is published
3. Network tab shows WebRTC connection is active

**Fix:**
- Verify camera is actually enabled in frontend
- Check WebRTC connection in Network tab
- Restart backend and try again

## Advanced Testing

### Test Screen Share

1. Click screen share icon (next to camera button)
2. Select screen/window/tab to share
3. Backend should log: `Video track subscribed: Screen Share`
4. Video tile should show your screen

### Test Camera Switching

1. Enable camera
2. Click device dropdown (next to camera button)
3. Select different camera
4. Video should switch to new camera
5. Backend should continue receiving frames

### Test Multiple Tracks

1. Enable camera
2. Enable screen share (should disable camera)
3. Disable screen share
4. Re-enable camera
5. Both should work independently

## Quick Test Script

Run this in browser console (F12) to check camera status:

```javascript
// Check if camera track is published
const room = window.room; // If you have room instance
if (room) {
  const localParticipant = room.localParticipant;
  const cameraTrack = localParticipant.getTrackPublication('camera');
  console.log('Camera track:', cameraTrack?.isMuted ? 'Muted' : 'Active');
  console.log('Camera dimensions:', cameraTrack?.dimensions);
}
```

## Expected Behavior

**When camera is working correctly:**

1. ✅ Camera button appears in control bar
2. ✅ Clicking camera button prompts for permission
3. ✅ Video tile shows live camera feed
4. ✅ Backend logs "Video track subscribed: Camera"
5. ✅ Video updates in real-time
6. ✅ No errors in browser console
7. ✅ No errors in backend terminal

## Success Indicators

**You'll know camera is working when:**

- You see your face/video in the tile
- Backend terminal shows "Video track subscribed: Camera"
- Browser console shows track published messages
- Video updates smoothly (no freezing)
- Camera can be toggled on/off without errors

---

**Need help?** Check browser console (F12) and backend terminal for error messages!


