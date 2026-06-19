import { useState, useEffect } from 'react';
import type { IncomingCall, Contact } from '../data/types';
import { useGameStore } from '../store/gameStore';
import { GlitchText } from './GlitchText';
import { Phone, PhoneOff, Video, Radio, User, AlertTriangle } from 'lucide-react';
import { useAudio } from '../hooks/useAudio';

interface IncomingCallOverlayProps {
  call: IncomingCall;
  contact: Contact | null;
  onAnswer: () => void;
  onReject: () => void;
}

const callTypeIcons = {
  voice: Phone,
  video: Video,
  holo: Radio,
};

const callTypeLabels = {
  voice: '语音通话',
  video: '视频通话',
  holo: '全息通话',
};

export function IncomingCallOverlay({ call, contact, onAnswer, onReject }: IncomingCallOverlayProps) {
  const { play } = useAudio();
  const [ringCount, setRingCount] = useState(0);
  const [showAutoAnswer, setShowAutoAnswer] = useState(false);

  useEffect(() => {
    const ringInterval = setInterval(() => {
      setRingCount((prev) => prev + 1);
      play('glitch');
    }, 1500);

    if (call.autoAnswer && call.autoAnswerDelay) {
      const autoAnswerTimer = setTimeout(() => {
        setShowAutoAnswer(true);
        setTimeout(() => {
          onAnswer();
        }, 1000);
      }, call.autoAnswerDelay);
      return () => {
        clearInterval(ringInterval);
        clearTimeout(autoAnswerTimer);
      };
    }

    return () => clearInterval(ringInterval);
  }, [call, onAnswer, play]);

  const CallTypeIcon = callTypeIcons[call.callType];
  const callTypeLabel = callTypeLabels[call.callType];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div
        className={`relative w-full max-w-md mx-4 bg-glitch-bg border-2 ${
          call.glitchLevel && call.glitchLevel > 1
            ? 'border-glitch-red animate-glitch-horizontal'
            : 'border-glitch-green'
        } p-8`}
      >
        {call.glitchLevel && call.glitchLevel > 0 && (
          <div className="absolute top-2 right-2 flex items-center gap-1 text-glitch-yellow text-xs">
            <AlertTriangle className="w-4 h-4" />
            <span>信号不稳定</span>
          </div>
        )}

        <div className="flex flex-col items-center">
          <div className="relative mb-6">
            <div
              className={`w-24 h-24 rounded-full border-4 flex items-center justify-center ${
                ringCount % 2 === 0
                  ? 'border-glitch-green/80 scale-100'
                  : 'border-glitch-green/40 scale-105'
              } transition-all duration-300`}
            >
              <div className="w-20 h-20 rounded-full bg-glitch-dark flex items-center justify-center border-2 border-glitch-green/50">
                {contact?.avatar ? (
                  <img
                    src={contact.avatar}
                    alt={contact.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User className="w-10 h-10 text-glitch-green" />
                )}
              </div>
            </div>
            <div
              className={`absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-glitch-dark border ${
                call.glitchLevel && call.glitchLevel > 0
                  ? 'border-glitch-yellow text-glitch-yellow'
                  : 'border-glitch-green text-glitch-green'
              } text-xs font-mono`}
            >
              <CallTypeIcon className="w-3 h-3 inline mr-1" />
              {callTypeLabel}
            </div>
          </div>

          {contact ? (
            <>
              <GlitchText
                text={contact.name}
                intensity={call.glitchLevel ?? 0}
                className="font-display text-2xl text-glitch-green text-shadow-glow-green mb-2 text-center"
              />
              {contact.statusMessage && (
                <p className="text-glitch-green/60 text-sm font-mono mb-1">
                  {contact.statusMessage}
                </p>
              )}
              <p className="text-glitch-green/40 text-xs font-mono">
                来电中... {Math.floor(ringCount * 1.5)}s
              </p>
            </>
          ) : (
            <>
              <GlitchText
                text="未知号码"
                intensity={2}
                className="font-display text-2xl text-glitch-red text-shadow-glow-red mb-2 text-center"
              />
              <p className="text-glitch-red/60 text-sm font-mono mb-1">
                加密频道
              </p>
              <p className="text-glitch-red/40 text-xs font-mono">
                来电中... {Math.floor(ringCount * 1.5)}s
              </p>
            </>
          )}

          {showAutoAnswer && (
            <div className="mt-4 px-4 py-2 bg-glitch-yellow/20 border border-glitch-yellow text-glitch-yellow text-sm font-mono animate-pulse">
              自动接听中...
            </div>
          )}

          <div className="flex gap-6 mt-8">
            {call.canReject !== false && (
              <button
                onClick={onReject}
                className="w-16 h-16 rounded-full bg-glitch-red/20 border-2 border-glitch-red flex items-center justify-center hover:bg-glitch-red/40 transition-all hover:scale-110"
              >
                <PhoneOff className="w-8 h-8 text-glitch-red" />
              </button>
            )}
            <button
              onClick={onAnswer}
              className="w-16 h-16 rounded-full bg-glitch-green/20 border-2 border-glitch-green flex items-center justify-center hover:bg-glitch-green/40 transition-all hover:scale-110 animate-pulse"
            >
              <Phone className="w-8 h-8 text-glitch-green" />
            </button>
          </div>

          <div className="flex gap-6 mt-3 text-xs text-glitch-green/40 font-mono">
            {call.canReject !== false && <span>拒接</span>}
            <span>接听</span>
          </div>
        </div>
      </div>
    </div>
  );
}
