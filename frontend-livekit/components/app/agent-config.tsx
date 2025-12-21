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
  tts_voice: 'zephyr', // Google Gemini TTS voice (lowercase)
  tts_language: 'en',
};

const GOOGLE_TTS_VOICES = [
  { id: 'zephyr', name: 'Zephyr (Default)' },
  { id: 'achernar', name: 'Achernar' },
  { id: 'achird', name: 'Achird' },
  { id: 'algenib', name: 'Algenib' },
  { id: 'algieba', name: 'Algieba' },
  { id: 'alnilam', name: 'Alnilam' },
  { id: 'aoede', name: 'Aoede' },
  { id: 'autonoe', name: 'Autonoe' },
  { id: 'callirrhoe', name: 'Callirrhoe' },
  { id: 'charon', name: 'Charon' },
  { id: 'despina', name: 'Despina' },
  { id: 'enceladus', name: 'Enceladus' },
  { id: 'erinome', name: 'Erinome' },
  { id: 'fenrir', name: 'Fenrir' },
  { id: 'gacrux', name: 'Gacrux' },
  { id: 'iapetus', name: 'Iapetus' },
  { id: 'kore', name: 'Kore' },
  { id: 'laomedeia', name: 'Laomedeia' },
  { id: 'leda', name: 'Leda' },
  { id: 'orus', name: 'Orus' },
  { id: 'puck', name: 'Puck' },
  { id: 'pulcherrima', name: 'Pulcherrima' },
  { id: 'rasalgethi', name: 'Rasalgethi' },
  { id: 'sadachbia', name: 'Sadachbia' },
  { id: 'sadaltager', name: 'Sadaltager' },
  { id: 'schedar', name: 'Schedar' },
  { id: 'sulafat', name: 'Sulafat' },
  { id: 'umbriel', name: 'Umbriel' },
  { id: 'vindemiatrix', name: 'Vindemiatrix' },
  { id: 'zubenelgenubi', name: 'Zubenelgenubi' },
];

interface AgentConfigProps {
  config: AgentConfigState;
  onConfigChange: (config: AgentConfigState) => void;
  isConfigPhase?: boolean;
}

export function AgentConfig({ config, onConfigChange, isConfigPhase = false }: AgentConfigProps) {
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

  const containerClasses = isConfigPhase
    ? "w-full rounded-lg border border-gray-300 bg-white p-4 text-black shadow-sm"
    : "absolute top-4 left-4 z-50 max-h-[80vh] w-80 overflow-y-auto rounded-lg border border-white/10 bg-black/80 p-4 text-white backdrop-blur-md";

  return (
    <div className={containerClasses}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className={`text-lg font-bold ${isConfigPhase ? 'text-black' : 'text-white'}`}>Agent Configuration</h3>
        {isSaved && <span className="text-xs text-green-600">✓ Saved</span>}
      </div>

      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-black">Instructions</label>
          <textarea
            value={config.instructions}
            onChange={(e) => handleChange('instructions', e.target.value)}
            className="h-32 w-full rounded border border-gray-300 bg-white p-2 text-sm text-black focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-black">STT Language</label>
          <select
            value={config.stt_language}
            onChange={(e) => handleChange('stt_language', e.target.value)}
            className="w-full rounded border border-gray-300 bg-white p-2 text-sm text-black focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            <option value="en">English</option>
            <option value="hi">Hindi</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-black">TTS Voice (Google Gemini)</label>
          <select
            value={config.tts_voice}
            onChange={(e) => handleChange('tts_voice', e.target.value)}
            className="w-full rounded border border-gray-300 bg-white p-2 text-sm text-black focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            {GOOGLE_TTS_VOICES.map(voice => (
              <option key={voice.id} value={voice.id}>{voice.name}</option>
            ))}
          </select>
          <p className="mt-1 text-xs text-black/60">
            Select a Google Gemini TTS voice. All voices are lowercase.
          </p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-black">TTS Language</label>
          <select
            value={config.tts_language}
            onChange={(e) => handleChange('tts_language', e.target.value)}
            className="w-full rounded border border-gray-300 bg-white p-2 text-sm text-black focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
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
            className={`rounded border px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 ${
              isConfigPhase
                ? 'border-gray-300 bg-gray-100 text-black hover:bg-gray-200 focus:ring-gray-300'
                : 'border-white/10 bg-white/5 text-white hover:bg-white/10 focus:ring-white/20'
            }`}
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
