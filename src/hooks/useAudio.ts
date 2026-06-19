import { useState, useCallback, useEffect } from 'react';
import {
  playTypingSound,
  playGlitchSound,
  playChoiceSound,
  playEndingSound,
  playErrorSound,
  playMessageSound,
  playRingSound,
} from '../utils/audio';

export function useAudio() {
  const [isMuted, setIsMuted] = useState(() => {
    const saved = localStorage.getItem('glitch_audio_muted');
    return saved === 'true';
  });

  useEffect(() => {
    localStorage.setItem('glitch_audio_muted', String(isMuted));
  }, [isMuted]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  const play = useCallback(
    (type: 'typing' | 'glitch' | 'choice' | 'ending' | 'error' | 'message' | 'ring') => {
      if (isMuted) return;
      switch (type) {
        case 'typing':
          playTypingSound();
          break;
        case 'glitch':
          playGlitchSound();
          break;
        case 'choice':
          playChoiceSound();
          break;
        case 'ending':
          playEndingSound();
          break;
        case 'error':
          playErrorSound();
          break;
        case 'message':
          playMessageSound();
          break;
        case 'ring':
          playRingSound();
          break;
      }
    },
    [isMuted]
  );

  return { isMuted, toggleMute, play };
}
