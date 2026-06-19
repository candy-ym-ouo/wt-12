import { useState, useEffect, useCallback, useRef } from 'react';

interface UseTypewriterOptions {
  speed?: number;
  onCharacter?: () => void;
  onComplete?: () => void;
}

export function useTypewriter(
  text: string,
  { speed = 40, onCharacter, onComplete }: UseTypewriterOptions = {}
) {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const indexRef = useRef(0);
  const timerRef = useRef<number | null>(null);

  const start = useCallback(() => {
    indexRef.current = 0;
    setDisplayedText('');
    setIsComplete(false);
    setIsTyping(true);
  }, []);

  const skip = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setDisplayedText(text);
    setIsComplete(true);
    setIsTyping(false);
    indexRef.current = text.length;
    onComplete?.();
  }, [text, onComplete]);

  useEffect(() => {
    if (!text) {
      setDisplayedText('');
      setIsComplete(true);
      return;
    }

    start();

    const typeNext = () => {
      if (indexRef.current < text.length) {
        setDisplayedText(text.slice(0, indexRef.current + 1));
        indexRef.current += 1;
        onCharacter?.();
        timerRef.current = window.setTimeout(typeNext, speed);
      } else {
        setIsComplete(true);
        setIsTyping(false);
        onComplete?.();
      }
    };

    timerRef.current = window.setTimeout(typeNext, speed);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [text, speed, onCharacter, onComplete, start]);

  return { displayedText, isComplete, isTyping, skip };
}
