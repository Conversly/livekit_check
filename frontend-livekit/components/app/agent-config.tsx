import * as React from 'react';

export interface AgentConfigState {
  instructions: string;
  stt_language: string;
  tts_voice: string;
  tts_language: string;
}

export const defaultAgentConfig: AgentConfigState = {
  instructions: `You are Raghu, a helpful voice AI assistant. The user is interacting with you via voice, even if you perceive the conversation as text.
            You eagerly assist users with their questions by providing information from your extensive knowledge.
            Your responses are concise, to the point, and without any complex formatting or punctuation including emojis, asterisks, or other symbols.
            You are curious, friendly, and have a sense of humor.`,
  stt_language: 'en',
  tts_voice: 'Zephyr', // Google Gemini TTS free-tier voice
  tts_language: 'en',
};

const GOOGLE_TTS_VOICES = [
  { id: 'Kore', name: 'Kore (Default)' },
  { id: 'Zephyr', name: 'Zephyr' },
];

interface AgentConfigProps {
  config: AgentConfigState;
  onConfigChange: (config: AgentConfigState) => void;
}

export function AgentConfig({ config, onConfigChange }: AgentConfigProps) {
  const [isSaved, setIsSaved] = React.useState(false);

  const handleChange = (field: keyof AgentConfigState, value: string) => {
    onConfigChange({ ...config, [field]: value });
    setIsSaved(false);
  };

  const handleSave = () => {
    // Config is auto-saved via useEffect in App component
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleReset = () => {
    onConfigChange(defaultAgentConfig);
    localStorage.removeItem('agentConfig');
    setIsSaved(false);
  };

  return (
    <div className="absolute top-4 left-4 z-50 max-h-[80vh] w-80 overflow-y-auto rounded-lg border border-white/10 bg-black/80 p-4 text-white backdrop-blur-md">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold">Agent Configuration</h3>
        {isSaved && <span className="text-xs text-green-400">✓ Saved</span>}
      </div>

      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Instructions</label>
          <textarea
            value={config.instructions}
            onChange={(e) => handleChange('instructions', e.target.value)}
            className="h-32 w-full rounded border border-white/10 bg-white/5 p-2 text-sm focus:border-white/30 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">STT Language</label>
          <select
            value={config.stt_language}
            onChange={(e) => handleChange('stt_language', e.target.value)}
            className="w-full rounded border border-white/10 bg-white/5 p-2 text-sm focus:border-white/30 focus:outline-none"
          >
            <option value="en">English</option>
            <option value="hi">Hindi</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">TTS Voice (Google Gemini)</label>
          <select
            value={GOOGLE_TTS_VOICES.some(v => v.id === config.tts_voice) ? config.tts_voice : 'custom'}
            onChange={(e) => handleChange('tts_voice', e.target.value === 'custom' ? config.tts_voice : e.target.value)}
            className="w-full rounded border border-white/10 bg-white/5 p-2 text-sm focus:border-white/30 focus:outline-none"
          >
            {GOOGLE_TTS_VOICES.map(voice => (
              <option key={voice.id} value={voice.id}>{voice.name}</option>
            ))}
            <option value="custom">Custom voice name...</option>
          </select>
          <input
            type="text"
            value={config.tts_voice}
            onChange={(e) => handleChange('tts_voice', e.target.value)}
            className="mt-2 w-full rounded border border-white/10 bg-white/5 p-2 text-sm focus:border-white/30 focus:outline-none"
            placeholder="e.g., Zephyr (leave blank to use default)"
          />
          <p className="mt-1 text-xs text-white/60">
            Uses Google Gemini TTS (preview). Leave empty to use the default voice.
          </p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">TTS Language</label>
          <select
            value={config.tts_language}
            onChange={(e) => handleChange('tts_language', e.target.value)}
            className="w-full rounded border border-white/10 bg-white/5 p-2 text-sm focus:border-white/30 focus:outline-none"
          >
            <option value="en">English</option>
            <option value="hi">Hindi</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={handleSave}
            className="flex-1 rounded bg-blue-600 px-4 py-2 text-sm font-medium transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Save Configuration
          </button>
          <button
            onClick={handleReset}
            className="rounded border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium transition-colors hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/20"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
