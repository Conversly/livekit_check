'use client';

import * as React from 'react';
import { LiveKitRoom, RoomAudioRenderer, StartAudio } from '@livekit/components-react';
import type { AppConfig } from '@/app-config';
import { AgentConfig, defaultAgentConfig, type AgentConfigState } from '@/components/app/agent-config';
import { ViewController } from '@/components/app/view-controller';
import { Toaster } from '@/components/livekit/toaster';
import { useAgentErrors } from '@/hooks/useAgentErrors';
import { useDebugMode } from '@/hooks/useDebug';

const IN_DEVELOPMENT = process.env.NODE_ENV !== 'production';

function AppSetup() {
  useDebugMode({ enabled: IN_DEVELOPMENT });
  useAgentErrors();

  return null;
}

interface AppProps {
  appConfig: AppConfig;
}

// Configuration Phase Component - shown before connection
function ConfigurationPhase({
  appConfig,
  agentConfig,
  onConfigChange,
  onStartCall,
  isLoading
}: {
  appConfig: AppConfig;
  agentConfig: AgentConfigState;
  onConfigChange: (config: AgentConfigState) => void;
  onStartCall: () => void;
  isLoading: boolean;
}) {
  return (
    <div className="min-h-svh flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Voice AI Assistant</h1>
          <p className="text-white/60 text-sm">Configure your agent settings below, then start the conversation</p>
        </div>

        {/* Configuration Panel */}
        <AgentConfig
          config={agentConfig}
          onConfigChange={onConfigChange}
          isConfigPhase={true}
        />

        {/* Start Button */}
        <button
          onClick={onStartCall}
          disabled={isLoading}
          className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 text-lg font-bold text-white transition-all hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Connecting...
            </span>
          ) : (
            appConfig.startButtonText || 'Start Conversation'
          )}
        </button>

        <p className="text-white/40 text-xs text-center">
          Note: Configuration can only be changed before connecting
        </p>
      </div>
    </div>
  );
}

// Connected Session Component - shown during active session
function ConnectedSession({
  appConfig,
}: {
  appConfig: AppConfig;
}) {
  return (
    <>
      <AppSetup />
      <main className="grid h-svh grid-cols-1 place-content-center">
        <ViewController appConfig={appConfig} onStart={() => { }} />
      </main>
      <StartAudio label="Start Audio" />
      <RoomAudioRenderer />
    </>
  );
}

export function App({ appConfig }: AppProps) {
  // Load saved config from localStorage on mount
  const [agentConfig, setAgentConfig] = React.useState<AgentConfigState>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('agentConfig');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          return defaultAgentConfig;
        }
      }
    }
    return defaultAgentConfig;
  });

  const [connectionDetails, setConnectionDetails] = React.useState<{
    serverUrl: string;
    participantToken: string;
  } | null>(null);
  const [shouldConnect, setShouldConnect] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleStartCall = React.useCallback(async () => {
    setIsLoading(true);
    console.log('Starting call with config:', agentConfig);
    try {
      const response = await fetch('/api/connection-details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent_config: agentConfig,
          room_config: appConfig.agentName ? {
            agents: [{ agent_name: appConfig.agentName }]
          } : undefined
        }),
      });
      const data = await response.json();
      console.log('Connection details received:', data);
      setConnectionDetails(data);
      setShouldConnect(true);
    } catch (e) {
      console.error('Failed to fetch token', e);
      setIsLoading(false);
    }
  }, [agentConfig, appConfig.agentName]);

  const handleDisconnect = React.useCallback(() => {
    setShouldConnect(false);
    setConnectionDetails(null);
    setIsLoading(false);
  }, []);

  // Save config to localStorage when it changes
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('agentConfig', JSON.stringify(agentConfig));
    }
  }, [agentConfig]);

  // Configuration Phase - before connection
  if (!connectionDetails || !shouldConnect) {
    return (
      <>
        <ConfigurationPhase
          appConfig={appConfig}
          agentConfig={agentConfig}
          onConfigChange={setAgentConfig}
          onStartCall={handleStartCall}
          isLoading={isLoading}
        />
        <Toaster />
      </>
    );
  }

  // Connected Session - show the voice interface
  return (
    <LiveKitRoom
      token={connectionDetails.participantToken}
      serverUrl={connectionDetails.serverUrl}
      connect={shouldConnect}
      video={false}
      audio={true}
      onDisconnected={handleDisconnect}
    >
      <ConnectedSession appConfig={appConfig} />
      <Toaster />
    </LiveKitRoom>
  );
}
