import { useEffect, useRef } from 'react';
import { useTypewriter } from '../hooks/useTypewriter';
import { useAudio } from '../hooks/useAudio';
import { GlitchText } from './GlitchText';
import type { StoryNode } from '../data/types';

interface StoryDisplayProps {
  node: StoryNode;
  onComplete: () => void;
}

export function StoryDisplay({ node, onComplete }: StoryDisplayProps) {
  const { play } = useAudio();
  const containerRef = useRef<HTMLDivElement>(null);
  const glitchLevel = node.glitchLevel ?? 0;

  const { displayedText, isComplete, isTyping, skip } = useTypewriter(node.text, {
    speed: Math.max(15, 40 - glitchLevel * 8),
    onCharacter: () => {
      if (Math.random() < 0.6) {
        play('typing');
      }
    },
    onComplete: () => {
      if (node.audioCue && node.audioCue !== 'ambient' && node.audioCue !== 'none') {
        const cue = node.audioCue as 'typing' | 'glitch' | 'choice' | 'ending' | 'error';
        play(cue);
      }
      onComplete();
    },
  });

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [displayedText]);

  const handleClick = () => {
    if (isTyping) {
      skip();
    } else if (node.type === 'narrative' && node.nextId) {
      onComplete();
    }
  };

  const shouldShowCursor = node.type === 'narrative' || isTyping;

  return (
    <div
      ref={containerRef}
      onClick={handleClick}
      className="w-full min-h-[200px] max-h-[50vh] overflow-y-auto p-4 cursor-pointer font-mono text-base leading-relaxed whitespace-pre-wrap scrollbar-thin"
    >
      {glitchLevel >= 2 ? (
        <GlitchText text={displayedText} intensity={glitchLevel} />
      ) : (
        <span className="text-glitch-green text-shadow-glow-green">
          {displayedText}
        </span>
      )}
      {shouldShowCursor && (
        <span className="terminal-cursor" />
      )}
      {!isTyping && node.type === 'narrative' && node.nextId && (
        <div className="text-glitch-blue/50 text-sm mt-6 animate-blink text-shadow-glow-blue">
          {'>>>'} 点击继续
        </div>
      )}
    </div>
  );
}
