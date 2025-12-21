'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ConnectionState } from 'livekit-client';
import { motion } from 'motion/react';
import { useChat, useConnectionState, useRoomContext, useRemoteParticipants } from '@livekit/components-react';
import type { AppConfig } from '@/app-config';
import { ChatTranscript } from '@/components/app/chat-transcript';
import { PreConnectMessage } from '@/components/app/preconnect-message';
import { TileLayout } from '@/components/app/tile-layout';
import {
  AgentControlBar,
  type ControlBarControls,
} from '@/components/livekit/agent-control-bar/agent-control-bar';
import { cn } from '@/lib/utils';
import { ScrollArea } from '../livekit/scroll-area/scroll-area';

const MotionBottom = motion.create('div');

const BOTTOM_VIEW_MOTION_PROPS = {
  variants: {
    visible: {
      opacity: 1,
      translateY: '0%',
    },
    hidden: {
      opacity: 0,
      translateY: '100%',
    },
  },
  initial: 'hidden',
  animate: 'visible',
  exit: 'hidden',
  transition: {
    duration: 0.3,
    delay: 0.5,
    ease: 'easeOut',
  },
};

interface FadeProps {
  top?: boolean;
  bottom?: boolean;
  className?: string;
}

export function Fade({ top = false, bottom = false, className }: FadeProps) {
  return (
    <div
      className={cn(
        'from-background pointer-events-none h-4 bg-linear-to-b to-transparent',
        top && 'bg-linear-to-b',
        bottom && 'bg-linear-to-t',
        className
      )}
    />
  );
}

interface SessionViewProps {
  appConfig: AppConfig;
  isPhoneCall?: boolean;
  phoneNumber?: string;
}

export const SessionView = ({
  appConfig,
  isPhoneCall = false,
  phoneNumber,
  ...props
}: React.ComponentProps<'section'> & SessionViewProps) => {
  const room = useRoomContext();
  const connectionState = useConnectionState(room);
  const { chatMessages: messages } = useChat();
  const remoteParticipants = useRemoteParticipants();
  // For phone calls, always show transcript. For voice calls, default to true
  const [chatOpen, setChatOpen] = useState(isPhoneCall ? true : true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  // Check if agent participant has joined
  const hasAgent = remoteParticipants.some((p) => p.isAgent || p.metadata?.includes('"agent":true'));
  
  // Check if SIP participant (phone) has joined
  // SIP participants have kind === 3 (PARTICIPANT_KIND_SIP)
  // Also check for SIP-specific attributes or metadata
  const hasSipParticipant = remoteParticipants.some((p) => {
    // Check kind property (3 = SIP participant)
    if ((p as any).kind === 3) return true;
    // Check for SIP-specific attributes
    if ((p as any).attributes?.['sip.callStatus']) return true;
    // Check metadata for SIP indicators
    if (p.metadata?.includes('"sip"') || p.metadata?.includes('"phone"')) return true;
    return false;
  });

  // Debug: Log messages to see if they're being received
  React.useEffect(() => {
    if (messages.length > 0) {
      console.log('Chat messages received:', messages.length, messages);
    }
  }, [messages]);

  const controls: ControlBarControls = {
    leave: true,
    microphone: true,
    chat: appConfig.supportsChatInput,
    camera: appConfig.supportsVideoInput,
    screenShare: appConfig.supportsVideoInput,
  };

  useEffect(() => {
    const lastMessage = messages.at(-1);
    const lastMessageIsLocal = lastMessage?.from?.isLocal === true;

    if (scrollAreaRef.current && lastMessageIsLocal) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // For phone calls, show minimal UI with just transcript
  if (isPhoneCall) {
    return (
      <section className="bg-background relative z-10 h-full w-full overflow-hidden" {...props}>
        {/* Phone Call Header */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-4 py-3">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-black">Phone Call</h2>
              <p className="text-sm text-gray-600">
                Calling: {phoneNumber || 'Unknown'}
                {hasSipParticipant ? (
                  <span className="ml-2 text-green-600">✓ Connected</span>
                ) : hasAgent ? (
                  <span className="ml-2 text-yellow-600">⏳ Connecting...</span>
                ) : (
                  <span className="ml-2 text-gray-500">⏳ Waiting for agent...</span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  hasSipParticipant ? 'bg-green-500 animate-pulse' : 
                  hasAgent ? 'bg-yellow-500 animate-pulse' : 
                  'bg-gray-400'
                }`}></div>
                <span className="text-sm text-gray-600">
                  {hasSipParticipant ? 'Call Active' : 
                   hasAgent ? 'Agent Connected' : 
                   'Connecting...'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Transcript - Always visible for phone calls */}
        <div className="fixed inset-0 grid grid-cols-1 grid-rows-1 pt-16">
          <Fade top className="absolute inset-x-4 top-16 h-20" />
          <ScrollArea ref={scrollAreaRef} className="px-4 pt-20 pb-[100px] md:px-6 md:pb-[120px]">
            <ChatTranscript
              hidden={false}
              messages={messages}
              className="mx-auto max-w-3xl space-y-3"
            />
          </ScrollArea>
        </div>

        {/* Bottom Controls - Minimal for phone calls */}
        <MotionBottom
          {...BOTTOM_VIEW_MOTION_PROPS}
          className="fixed inset-x-3 bottom-0 z-50 md:inset-x-12"
        >
          <div className="bg-background relative mx-auto max-w-2xl pb-3 md:pb-12">
            <Fade bottom className="absolute inset-x-0 top-0 h-4 -translate-y-full" />
            <AgentControlBar
              controls={{
                leave: true,
                microphone: false, // Hide mic for phone calls
                chat: false, // Hide chat toggle for phone calls
                camera: false,
                screenShare: false,
              }}
              isConnected={connectionState === ConnectionState.Connected}
              onDisconnect={() => room.disconnect()}
              onChatOpenChange={setChatOpen}
            />
          </div>
        </MotionBottom>
      </section>
    );
  }

  // Regular voice call UI
  return (
    <section className="bg-background relative z-10 h-full w-full overflow-hidden" {...props}>
      {/* Chat Transcript */}
      <div
        className={cn(
          'fixed inset-0 grid grid-cols-1 grid-rows-1 transition-opacity duration-300',
          !chatOpen && 'pointer-events-none opacity-0'
        )}
      >
        <Fade top className="absolute inset-x-4 top-0 h-40" />
        <ScrollArea ref={scrollAreaRef} className="px-4 pt-40 pb-[150px] md:px-6 md:pb-[200px]">
          <ChatTranscript
            hidden={false}
            messages={messages}
            className="mx-auto max-w-2xl space-y-3"
          />
        </ScrollArea>
      </div>

      {/* Tile Layout - Only render when agent has joined */}
      {hasAgent && <TileLayout chatOpen={chatOpen} />}

      {/* Bottom */}
      <MotionBottom
        {...BOTTOM_VIEW_MOTION_PROPS}
        className="fixed inset-x-3 bottom-0 z-50 md:inset-x-12"
      >
        {appConfig.isPreConnectBufferEnabled && (
          <PreConnectMessage messages={messages} className="pb-4" />
        )}
        <div className="bg-background relative mx-auto max-w-2xl pb-3 md:pb-12">
          <Fade bottom className="absolute inset-x-0 top-0 h-4 -translate-y-full" />
          <AgentControlBar
            controls={controls}
            isConnected={connectionState === ConnectionState.Connected}
            onDisconnect={() => room.disconnect()}
            onChatOpenChange={setChatOpen}
          />
        </div>
      </MotionBottom>
    </section>
  );
};
