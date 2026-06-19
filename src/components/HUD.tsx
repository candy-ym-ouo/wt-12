import { useState } from 'react';
import { Volume2, VolumeX, Save, Home, Book, ChevronDown, ChevronUp, Shield, Puzzle } from 'lucide-react';
import { useAudio } from '../hooks/useAudio';
import { useGameStore } from '../store/gameStore';
import { useNavigate } from 'react-router-dom';
import { ChapterMetadataPanel } from './ChapterMetadata';
import { FactionReputationPanel } from './FactionReputationPanel';
import { EvidencePanel } from './EvidencePanel';

interface HUDProps {
  onSave?: () => void;
}

export function HUD({ onSave }: HUDProps) {
  const { isMuted, toggleMute } = useAudio();
  const { storyPackage, chapter, saveToStorage, resetGame, clearStoryPackage } = useGameStore();
  const navigate = useNavigate();
  const [showChapterPanel, setShowChapterPanel] = useState(false);
  const [showReputationPanel, setShowReputationPanel] = useState(false);
  const [showEvidencePanel, setShowEvidencePanel] = useState(false);
  const hasFactions = storyPackage?.factions && storyPackage.factions.length > 0;
  const hasEvidence = (storyPackage?.evidenceClues?.length ?? 0) > 0 ||
    (storyPackage?.encodedLogs?.length ?? 0) > 0 ||
    (storyPackage?.hiddenNodeTriggers?.length ?? 0) > 0;

  const handleSave = () => {
    saveToStorage();
    onSave?.();
  };

  const handleQuit = () => {
    resetGame();
    clearStoryPackage();
    navigate('/');
  };

  const currentChapterData = storyPackage?.chapters.find((c) => c.id === chapter);

  return (
    <div className="w-full">
      <div className="w-full flex items-center justify-between px-4 py-2 border-b border-glitch-green/30 bg-glitch-bg/50 backdrop-blur">
        <div className="flex items-center gap-3 sm:gap-4">
          {storyPackage && (
            <span className="text-glitch-magenta/80 text-xs font-mono hidden sm:inline text-shadow-glow-red">
              {storyPackage.title}
            </span>
          )}
          <div
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => {
              setShowChapterPanel(!showChapterPanel);
              if (!showChapterPanel) { setShowReputationPanel(false); setShowEvidencePanel(false); }
            }}
          >
            <Book className="w-4 h-4 text-glitch-blue" />
            <span className="text-glitch-yellow text-shadow-glow-yellow font-mono text-sm">
              [ 章节 {chapter} ]
            </span>
            {currentChapterData && (
              <span className="text-glitch-green/80 text-xs font-mono hidden sm:inline">
                {currentChapterData.title}
              </span>
            )}
            {showChapterPanel ? (
              <ChevronUp className="w-3.5 h-3.5 text-glitch-green/60" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-glitch-green/60" />
            )}
          </div>

          {hasFactions && (
            <button
              onClick={() => {
                setShowReputationPanel(!showReputationPanel);
                if (!showReputationPanel) { setShowChapterPanel(false); setShowEvidencePanel(false); }
              }}
              className="flex items-center gap-2 p-1.5 hover:bg-glitch-magenta/20 transition-colors group"
              title="势力声望"
            >
              <Shield className="w-4 h-4 text-glitch-magenta group-hover:text-shadow-glow-red" />
              <span className="text-glitch-magenta text-shadow-glow-red font-mono text-xs hidden sm:inline">
                声望
              </span>
              {showReputationPanel ? (
                <ChevronUp className="w-3.5 h-3.5 text-glitch-magenta/60" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-glitch-magenta/60" />
              )}
            </button>
          )}

          {hasEvidence && (
            <button
              onClick={() => {
                setShowEvidencePanel(!showEvidencePanel);
                if (!showEvidencePanel) { setShowChapterPanel(false); setShowReputationPanel(false); }
              }}
              className="flex items-center gap-2 p-1.5 hover:bg-glitch-yellow/20 transition-colors group"
              title="证据拼图"
            >
              <Puzzle className="w-4 h-4 text-glitch-yellow group-hover:text-shadow-glow-yellow" />
              <span className="text-glitch-yellow text-shadow-glow-yellow font-mono text-xs hidden sm:inline">
                证据
              </span>
              {showEvidencePanel ? (
                <ChevronUp className="w-3.5 h-3.5 text-glitch-yellow/60" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-glitch-yellow/60" />
              )}
            </button>
          )}
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

      {showChapterPanel && storyPackage && (
        <div className="w-full max-w-4xl mx-auto px-4 py-3">
          <ChapterMetadataPanel
            storyPackage={storyPackage}
            currentChapter={chapter}
            onClose={() => setShowChapterPanel(false)}
          />
        </div>
      )}

      {showReputationPanel && storyPackage && hasFactions && (
        <div className="w-full max-w-4xl mx-auto px-4 py-3">
          <div className="border border-glitch-magenta/30 bg-glitch-bg/80 backdrop-blur p-4">
            <FactionReputationPanel />
          </div>
        </div>
      )}

      {showEvidencePanel && storyPackage && hasEvidence && (
        <div className="w-full max-w-4xl mx-auto px-4 py-3">
          <EvidencePanel onClose={() => setShowEvidencePanel(false)} />
        </div>
      )}
    </div>
  );
}
