import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { HUD } from '../components/HUD';
import { TerminalWindow } from '../components/TerminalWindow';
import { StoryDisplay } from '../components/StoryDisplay';
import { BranchChoice } from '../components/BranchChoice';
import { TextInput } from '../components/TextInput';
import { GlitchText } from '../components/GlitchText';
import { useGameStore } from '../store/gameStore';
import { useAudio } from '../hooks/useAudio';
import type { StoryNode, Choice, Ending, FactionReputationChange } from '../data/types';
import { ArrowLeft, Save } from 'lucide-react';

export function GamePage() {
  const navigate = useNavigate();
  const { play } = useAudio();
  const {
    storyPackage,
    currentNodeId,
    goToNode,
    setFlag,
    recordEnding,
    changeReputation,
  } = useGameStore();

  const [currentNode, setCurrentNode] = useState<StoryNode | null>(null);
  const [isTextComplete, setIsTextComplete] = useState(false);
  const [endingShown, setEndingShown] = useState<Ending | null>(null);
  const [saveNotice, setSaveNotice] = useState(false);
  const [reputationNotice, setReputationNotice] = useState<FactionReputationChange[] | null>(null);

  useEffect(() => {
    if (!storyPackage) {
      navigate('/');
      return;
    }
    if (!currentNodeId) {
      navigate('/');
      return;
    }
    const node = storyPackage.nodes[currentNodeId];
    if (node) {
      setCurrentNode(node);
      setIsTextComplete(false);
      setEndingShown(null);
    }
  }, [storyPackage, currentNodeId, navigate]);

  const handleTextComplete = useCallback(() => {
    setIsTextComplete(true);
    if (currentNode?.type === 'ending' && currentNode.ending) {
      recordEnding(currentNode.ending.id);
      setEndingShown(currentNode.ending);
      play('ending');
    }
  }, [currentNode, recordEnding, play]);

  const handleNarrativeContinue = useCallback(() => {
    if (!currentNode || currentNode.type !== 'narrative' || !isTextComplete) return;
    if (currentNode.nextId) {
      goToNode(currentNode.nextId);
    }
  }, [currentNode, isTextComplete, goToNode]);

  const handleChoiceSelect = useCallback(
    (choice: Choice) => {
      play('choice');
      if (choice.setFlag) {
        setFlag(choice.setFlag);
      }
      if (choice.reputationChanges && choice.reputationChanges.length > 0) {
        const applied = changeReputation(choice.reputationChanges);
        if (applied.length > 0) {
          setReputationNotice(applied);
          setTimeout(() => setReputationNotice(null), 2500);
        }
      }
      goToNode(choice.nextId, choice.id);
    },
    [play, setFlag, goToNode, changeReputation]
  );

  const handleInputSubmit = useCallback(
    (value: string) => {
      if (!currentNode || currentNode.type !== 'input') return;
      const keyword = currentNode.inputKeyword;
      if (!keyword) {
        if (currentNode.nextId) goToNode(currentNode.nextId);
        return;
      }
      const regex = new RegExp(keyword, 'i');
      if (regex.test(value)) {
        play('choice');
        if (currentNode.nextId) goToNode(currentNode.nextId);
      } else {
        play('error');
        if (currentNode.inputFailureNextId) {
          goToNode(currentNode.inputFailureNextId);
        }
      }
    },
    [currentNode, play, goToNode]
  );

  const handleSave = () => {
    setSaveNotice(true);
    play('choice');
    setTimeout(() => setSaveNotice(false), 1500);
  };

  const handleRestart = () => {
    navigate('/');
  };

  if (!currentNode) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <GlitchText text="加载中..." intensity={2} className="text-2xl text-glitch-green" />
      </div>
    );
  }

  if (endingShown) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center p-4">
        <TerminalWindow
          title={`ENDING://${endingShown.id}`}
          className="max-w-2xl"
        >
          <div className="p-6 sm:p-10 flex flex-col items-center gap-6 text-center">
            <div>
              <GlitchText
                text="=== 结局达成 ==="
                intensity={1}
                className="font-display text-xl sm:text-2xl text-glitch-yellow text-shadow-glow-yellow"
                charGlitch={false}
              />
            </div>
            <GlitchText
              text={endingShown.title}
              intensity={2}
              className="font-display text-3xl sm:text-4xl text-glitch-magenta text-shadow-glow-red"
            />
            <div className="max-w-lg mt-4 text-glitch-green/90 font-mono leading-relaxed text-shadow-glow-green">
              {endingShown.description}
            </div>
            {endingShown.isHidden && (
              <div className="mt-2 text-glitch-yellow text-sm font-mono animate-blink text-shadow-glow-yellow">
                ★ 隐藏结局解锁 ★
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-3 mt-6 w-full max-w-sm">
              <button onClick={handleRestart} className="glitch-btn flex items-center justify-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                返回主菜单
              </button>
            </div>
          </div>
        </TerminalWindow>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col">
      <HUD onSave={handleSave} />

      {saveNotice && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-glitch-bg border border-glitch-green px-4 py-2 text-glitch-green font-mono text-sm text-shadow-glow-green animate-glitch-horizontal">
          <Save className="w-4 h-4 inline mr-2" />
          游戏已保存
        </div>
      )}

      {reputationNotice && reputationNotice.length > 0 && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-glitch-bg border px-4 py-2 font-mono text-sm animate-glitch-horizontal flex flex-col gap-1 min-w-[200px]"
          style={{
            borderColor: reputationNotice.some((c) => c.change > 0) ? '#00ff66' : '#ff0055',
          }}
        >
          {reputationNotice.map((change, idx) => {
            const faction = storyPackage?.factions?.find((f) => f.id === change.factionId);
            const name = faction?.name ?? change.factionId;
            const color = change.change > 0 ? '#00ff66' : '#ff0055';
            const sign = change.change > 0 ? '+' : '';
            return (
              <div key={idx} style={{ color, textShadow: `0 0 8px ${color}` }}>
                {name} {sign}{change.change}
              </div>
            );
          })}
        </div>
      )}

      <div className="flex-1 w-full flex items-center justify-center p-4 sm:p-8">
        <TerminalWindow
          title={`node://${currentNode.id} [ch.${currentNode.chapter ?? 1}]`}
          className="w-full"
        >
          <div className="p-4 sm:p-6">
            <StoryDisplay node={currentNode} onComplete={handleTextComplete} />

            {currentNode.type === 'narrative' && isTextComplete && currentNode.nextId && (
              <div className="px-4 pb-4">
                <button
                  onClick={handleNarrativeContinue}
                  className="glitch-btn w-full !py-3 flex items-center justify-center gap-2"
                >
                  继续 →
                </button>
              </div>
            )}

            {currentNode.type === 'choice' && isTextComplete && currentNode.choices && (
              <div className="px-4 pb-4">
                <BranchChoice
                  choices={currentNode.choices}
                  onSelect={handleChoiceSelect}
                  disabled={!isTextComplete}
                />
              </div>
            )}

            {currentNode.type === 'input' && isTextComplete && (
              <div className="px-4 pb-6">
                <TextInput
                  hint={currentNode.inputHint ?? '> 输入指令...'}
                  onSubmit={handleInputSubmit}
                  disabled={!isTextComplete}
                  onTyping={() => play('typing')}
                  onError={() => play('error')}
                />
              </div>
            )}
          </div>
        </TerminalWindow>
      </div>
    </div>
  );
}
