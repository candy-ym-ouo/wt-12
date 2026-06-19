import { useGlitch } from '../hooks/useGlitch';

interface GlitchTextProps {
  text: string;
  intensity?: number;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
  charGlitch?: boolean;
}

export function GlitchText({
  text,
  intensity = 1,
  className = '',
  as: Tag = 'span',
  charGlitch = true,
}: GlitchTextProps) {
  const { displayText, glitchState, isGlitching } = useGlitch(text, {
    intensity,
    charGlitch,
  });

  const style: React.CSSProperties = {
    transform: `translate(${glitchState.offsetX}px, ${glitchState.offsetY}px) skew(${glitchState.skew}deg)`,
    filter: isGlitching ? `hue-rotate(${glitchState.hueRotate}deg)` : 'none',
    display: 'inline-block',
    position: 'relative',
  };

  const TagName = Tag as keyof JSX.IntrinsicElements;

  if (intensity <= 0) {
    return <TagName className={className}>{text}</TagName>;
  }

  return (
    <TagName
      className={`relative inline-block ${className}`}
      style={style}
      data-text={text}
    >
      <span
        className="absolute left-0 top-0 w-full h-full text-glitch-red opacity-70"
        style={{
          transform: isGlitching ? 'translate(-2px, 0)' : 'translate(0)',
          clipPath: 'polygon(0 0, 100% 0, 100% 45%, 0 45%)',
          transition: 'transform 0.05s',
        }}
        aria-hidden="true"
      >
        {displayText}
      </span>
      <span
        className="absolute left-0 top-0 w-full h-full text-glitch-blue opacity-70"
        style={{
          transform: isGlitching ? 'translate(2px, 0)' : 'translate(0)',
          clipPath: 'polygon(0 55%, 100% 55%, 100% 100%, 0 100%)',
          transition: 'transform 0.05s',
        }}
        aria-hidden="true"
      >
        {displayText}
      </span>
      <span className="relative z-10">{displayText}</span>
    </TagName>
  );
}
