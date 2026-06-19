import type { Message } from '../data/types';
import { GlitchText } from './GlitchText';
import { FileText, Image, Volume2, AlertCircle } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
  senderName?: string;
  isGrouped?: boolean;
}

const typeIcons = {
  text: null,
  image: Image,
  audio: Volume2,
  file: FileText,
  system: AlertCircle,
};

export function MessageBubble({ message, senderName, isGrouped = false }: MessageBubbleProps) {
  const isPlayer = message.senderId === 'player';
  const TypeIcon = typeIcons[message.type];

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (message.type === 'system') {
    return (
      <div className="flex justify-center my-4">
        <div className="bg-glitch-dark/80 border border-glitch-yellow/30 px-4 py-2 rounded-sm">
          <span className="text-glitch-yellow text-sm font-mono">
            {message.content}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isPlayer ? 'justify-end' : 'justify-start'} mb-2 ${isGrouped ? 'mt-0' : 'mt-4'}`}>
      <div className={`max-w-[80%] ${isPlayer ? 'order-1' : 'order-2'}`}>
        {!isGrouped && !isPlayer && senderName && (
          <div className="text-xs text-glitch-green/60 mb-1 font-mono">
            {senderName}
          </div>
        )}
        <div
          className={`relative px-4 py-2 rounded-sm ${
            isPlayer
              ? 'bg-glitch-green/20 border border-glitch-green/50 text-glitch-green'
              : 'bg-glitch-dark border border-glitch-green/20 text-glitch-green/90'
          } ${message.glitchLevel ? 'animate-glitch-horizontal' : ''}`}
        >
          {TypeIcon && (
            <div className="flex items-center gap-2 mb-2">
              <TypeIcon className="w-4 h-4" />
              <span className="text-xs text-glitch-green/60 uppercase">
                {message.type}
              </span>
            </div>
          )}
          {message.glitchLevel && message.glitchLevel > 0 ? (
            <GlitchText
              text={message.content}
              intensity={message.glitchLevel}
              className="font-mono text-sm leading-relaxed"
            />
          ) : (
            <p className="font-mono text-sm leading-relaxed whitespace-pre-wrap">
              {message.content}
            </p>
          )}
          {message.metadata && Object.keys(message.metadata).length > 0 && (
            <div className="mt-2 pt-2 border-t border-glitch-green/20 text-xs text-glitch-green/50">
              {Object.entries(message.metadata).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span>{key}:</span>
                  <span className="text-glitch-green/70">{String(value)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div
          className={`text-xs text-glitch-green/40 mt-1 font-mono ${
            isPlayer ? 'text-right' : 'text-left'
          }`}
        >
          {formatTime(message.timestamp)}
          {isPlayer && (
            <span className="ml-2">
              {message.isRead ? '✓✓' : '✓'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
