import { useEffect } from 'react';
import { ConnectionState } from 'livekit-client';
import { useConnectionState, useRoomContext, useRemoteParticipants } from '@livekit/components-react';
import { toastAlert } from '@/components/livekit/alert-toast';

export function useAgentErrors() {
  const room = useRoomContext();
  const connectionState = useConnectionState(room);
  const remoteParticipants = useRemoteParticipants();

  useEffect(() => {
    if (connectionState !== ConnectionState.Connected) return;

    // Find agent participant
    const agentParticipant = remoteParticipants.find(
      (p) => p.isAgent || p.metadata?.includes('"agent":true')
    );

    if (!agentParticipant) return;

    // Check for agent attributes that indicate failure
    const attributes = agentParticipant.attributes;
    const agentState = attributes?.['lk.agent.state'];
    
    if (agentState === 'failed') {
      const failureReason = attributes?.['lk.agent.failure_reason'] || 'Unknown error';
      const reasons = failureReason.split(',').map((r: string) => r.trim());

      toastAlert({
        title: 'Session ended',
        description: (
          <>
            {reasons.length > 1 && (
              <ul className="list-inside list-disc">
                {reasons.map((reason) => (
                  <li key={reason}>{reason}</li>
                ))}
              </ul>
            )}
            {reasons.length === 1 && <p className="w-full">{reasons[0]}</p>}
            <p className="w-full">
              <a
                target="_blank"
                rel="noopener noreferrer"
                href="https://docs.livekit.io/agents/start/voice-ai/"
                className="whitespace-nowrap underline"
              >
                See quickstart guide
              </a>
              .
            </p>
          </>
        ),
      });

      room.disconnect();
    }
  }, [connectionState, remoteParticipants, room]);
}
