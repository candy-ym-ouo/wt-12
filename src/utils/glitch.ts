const GLITCH_CHARS = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`\\01';

export function applyCharGlitch(text: string, intensity: number = 1): string {
  if (intensity <= 0) return text;
  const chars = text.split('');
  const glitchProbability = Math.min(0.05 * intensity, 0.3);

  return chars
    .map((char) => {
      if (char === ' ' || char === '\n') return char;
      if (Math.random() < glitchProbability) {
        return GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
      }
      return char;
    })
    .join('');
}

export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export interface GlitchState {
  offsetX: number;
  offsetY: number;
  skew: number;
  hueRotate: number;
}

export function generateGlitchState(intensity: number = 1): GlitchState {
  const factor = Math.min(intensity, 3);
  return {
    offsetX: (Math.random() - 0.5) * 4 * factor,
    offsetY: (Math.random() - 0.5) * 2 * factor,
    skew: (Math.random() - 0.5) * 2 * factor,
    hueRotate: (Math.random() - 0.5) * 30 * factor,
  };
}
