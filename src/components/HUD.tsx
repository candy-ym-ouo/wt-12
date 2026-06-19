import { Volume2, VolumeX, Save, Home, RotateCcw } from 'lucide-react';
import { useAudio } from '../hooks/useAudio';
import { useGameStore } from '../store/gameStore';
import { useNavigate } from 'react-router-dom';

interface HUDProps {
  onSave?: () => void;
}

export function HUD({ onSave }: HUDProps) {
  const { isMuted, toggleMute } = useAudio();
  const { chapter, saveToStorage, resetGame } = useGameStore();
  const navigate = useNavigate();

  const handleSave = () => {
    saveToStorage();
    onSave?.();
  };

  const handleQuit = () => {
    resetGame();
    navigate('/');
  };

  return (
    <div className="w-full flex items-center justify-between px-4 py-2 border-b border-glitch-green/30 bg-glitch-bg/50 backdrop-blur">
      <div className="flex items-center gap-4">
        <span className="text-glitch-yellow text-shadow-glow-yellow font-mono text-sm">
          [ 章节 {chapter} ]
        </span>
        <span className="text-glitch-green/60 text-xs font-mono hidden sm:inline">
          GLITCH://NEURAL_NET
        </span>
      </div>
      <div className="flex items-center gap-1 sm:gap-2">
        <button
          onClick={handleSave}
          className="p-2 hover:bg-glitch-green/20 transition-colors group"
          title="保存游戏"
        >
          <Save className="w-4 h-4 text-glitch-green group-hover:text-shadow-glow-green" />
        </button>
        <button
          onClick={toggleMute}
          className="p-2 hover:bg-glitch-green/20 transition-colors group"
          title={isMuted ? '开启音效' : '关闭音效'}
        >
          {isMuted ? (
            <VolumeX className="w-4 h-4 text-glitch-red group-hover:text-shadow-glow-red" />
          ) : (
            <Volume2 className="w-4 h-4 text-glitch-green group-hover:text-shadow-glow-green" />
          )}
        </button>
        <button
          onClick={handleQuit}
          className="p-2 hover:bg-glitch-red/20 transition-colors group"
          title="返回主菜单"
        >
          <Home className="w-4 h-4 text-glitch-red group-hover:text-shadow-glow-red" />
        </button>
      </div>
    </div>
  );
}
