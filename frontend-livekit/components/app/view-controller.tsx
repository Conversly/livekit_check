'use client';

import { ConnectionState } from 'livekit-client';
import { AnimatePresence, motion } from 'motion/react';
import { useConnectionState, useRoomContext } from '@livekit/components-react';
import type { AppConfig } from '@/app-config';
import { SessionView } from '@/components/app/session-view';
import { WelcomeView } from '@/components/app/welcome-view';

const MotionWelcomeView = motion.create(WelcomeView);
const MotionSessionView = motion.create(SessionView);

const VIEW_MOTION_PROPS = {
  variants: {
    visible: {
      opacity: 1,
    },
    hidden: {
      opacity: 0,
    },
  },
  initial: 'hidden',
  animate: 'visible',
  exit: 'hidden',
  transition: {
    duration: 0.5,
    ease: 'linear',
  },
};

interface ViewControllerProps {
  appConfig: AppConfig;
  onStart: () => void;
  isPhoneCall?: boolean;
  phoneNumber?: string;
}

export function ViewController({ appConfig, onStart, isPhoneCall, phoneNumber }: ViewControllerProps) {
  const room = useRoomContext();
  const connectionState = useConnectionState(room);
  const isConnected = connectionState === ConnectionState.Connected;

  return (
    <AnimatePresence mode="wait">
      {/* Welcome view */}
      {!isConnected && (
        <MotionWelcomeView
          key="welcome"
          {...VIEW_MOTION_PROPS}
          startButtonText={appConfig.startButtonText}
          onStartCall={onStart}
        />
      )}
      {/* Session view */}
      {isConnected && (
        <MotionSessionView 
          key="session-view" 
          {...VIEW_MOTION_PROPS} 
          appConfig={appConfig}
          isPhoneCall={isPhoneCall}
          phoneNumber={phoneNumber}
        />
      )}
    </AnimatePresence>
  );
}
