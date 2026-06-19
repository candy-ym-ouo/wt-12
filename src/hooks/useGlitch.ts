import { useState, useEffect, useRef } from 'react';
import { applyCharGlitch, generateGlitchState, type GlitchState } from '../utils/glitch';

interface UseGlitchOptions {
  intensity?: number;
  interval?: number;
  charGlitch?: boolean;
}

export function useGlitch(text: string, { intensity = 1, interval = 120, charGlitch = true }: UseGlitchOptions = {}) {
  const [displayText, setDisplayText] = useState(text);
  const [glitchState, setGlitchState] = useState<GlitchState>({
    offsetX: 0,
    offsetY: 0,
    skew: 0,
    hueRotate: 0,
  });
  const [isGlitching, setIsGlitching] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (intensity <= 0) {
      setDisplayText(text);
      setGlitchState({ offsetX: 0, offsetY: 0, skew: 0, hueRotate: 0 });
      setIsGlitching(false);
      return;
    }

    const tick = () => {
      const shouldGlitch = Math.random() < 0.3 * intensity;
      if (shouldGlitch) {
        setIsGlitching(true);
        if (charGlitch) {
          setDisplayText(applyCharGlitch(text, intensity));
        }
        setGlitchState(generateGlitchState(intensity));
      } else {
        setIsGlitching(false);
        setDisplayText(text);
        setGlitchState({ offsetX: 0, offsetY: 0, skew: 0, hueRotate: 0 });
      }
      timerRef.current = window.setTimeout(tick, interval);
    };

    timerRef.current = window.setTimeout(tick, interval);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [text, intensity, interval, charGlitch]);

  return { displayText, glitchState, isGlitching };
}
