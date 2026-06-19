import type { ReactNode } from 'react';

interface TerminalWindowProps {
  children: ReactNode;
  title?: string;
  className?: string;
}

export function TerminalWindow({ children, title, className = '' }: TerminalWindowProps) {
  return (
    <div className={`crt-screen relative w-full max-w-4xl mx-auto ${className}`}>
      {title && (
        <div className="flex items-center gap-2 px-4 py-2 border-b border-glitch-green/30 bg-glitch-green/5">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-glitch-red shadow-[0_0_8px_rgba(255,0,60,0.6)]" />
            <span className="w-3 h-3 rounded-full bg-glitch-yellow shadow-[0_0_8px_rgba(255,255,0,0.6)]" />
            <span className="w-3 h-3 rounded-full bg-glitch-green shadow-[0_0_8px_rgba(0,255,65,0.6)]" />
          </div>
          <span className="text-xs text-glitch-green/70 font-mono ml-2 text-shadow-glow-green">
            {title}
          </span>
        </div>
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
