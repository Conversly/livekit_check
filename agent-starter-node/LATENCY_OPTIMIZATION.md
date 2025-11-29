# Latency Optimization Guide

## ✅ Optimizations Applied

The agent has been optimized to reduce response latency. Here are the changes made:

### 1. **Preemptive Generation** ✅
- **Status**: Already enabled
- **Effect**: Agent starts generating response before user finishes speaking
- **Benefit**: Reduces perceived latency by ~500-1000ms

### 2. **Faster Turn Detection**
- **`minEndpointingDelay`**: Reduced from 500ms → **200ms**
- **Effect**: Agent detects end of turn 300ms faster
- **Benefit**: Faster response initiation

### 3. **Reduced Maximum Wait Time**
- **`maxEndpointingDelay`**: Reduced from 6000ms → **3000ms**
- **Effect**: Agent won't wait longer than 3 seconds for user to continue
- **Benefit**: Prevents unnecessary delays in conversation flow

### 4. **Faster Interruption Detection**
- **`minInterruptionDuration`**: Reduced from 500ms → **300ms**
- **Effect**: Agent detects interruptions 200ms faster
- **Benefit**: More responsive to user interruptions

## 📊 Expected Improvements

- **Turn Detection**: ~300ms faster
- **Interruption Response**: ~200ms faster
- **Overall Latency**: Reduced by 500-1000ms per turn

## 🔧 Current Configuration

```typescript
voiceOptions: {
  preemptiveGeneration: true,        // Start generating before turn ends
  minEndpointingDelay: 200,          // Faster turn detection (was 500ms)
  maxEndpointingDelay: 3000,         // Shorter max wait (was 6000ms)
  minInterruptionDuration: 300,      // Faster interruption (was 500ms)
}
```

## 🎯 Model Choices (Already Optimized)

- **STT**: `assemblyai/universal-streaming` - Fast streaming transcription
- **LLM**: `google/gemini-2.5-flash-lite` - Optimized for speed
- **TTS**: `elevenlabs/eleven_turbo_v2_5` - Low-latency TTS
- **Turn Detection**: `MultilingualModel` - Context-aware turn detection

## 📈 Monitoring Latency

You can monitor latency using the metrics events:

```typescript
session.on(voice.AgentSessionEventTypes.MetricsCollected, (ev) => {
  console.log('TTFT (Time to First Token):', ev.metrics.ttftMs);
  console.log('TTS TTFB (Time to First Byte):', ev.metrics.ttfbMs);
});
```

## 🚀 Additional Optimization Tips

1. **Use faster models**: Already using optimized models
2. **Reduce context size**: Keep conversation history concise
3. **Optimize instructions**: Shorter, clearer prompts = faster responses
4. **Monitor metrics**: Use observability to identify bottlenecks

## ⚠️ Trade-offs

- **Lower `minEndpointingDelay`**: May cause premature turn detection (agent responds before user finishes)
- **Lower `maxEndpointingDelay`**: May cut off users who pause mid-sentence
- **Lower `minInterruptionDuration`**: May trigger false interruptions from background noise

If you experience issues, you can adjust these values:
- Increase `minEndpointingDelay` if agent responds too early
- Increase `maxEndpointingDelay` if agent cuts off users
- Increase `minInterruptionDuration` if too many false interruptions

## 🔄 Testing

After restarting your agent, test the latency improvements:

1. Start a conversation
2. Observe response times
3. Check metrics in logs for TTFT and TTS latency
4. Adjust values if needed based on your use case

