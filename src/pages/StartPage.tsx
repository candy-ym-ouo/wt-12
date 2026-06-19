import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Terminal, Trophy, Layers, Archive, Shield } from 'lucide-react';
import { GlitchText } from '../components/GlitchText';
import { TerminalWindow } from '../components/TerminalWindow';
import { useGameStore } from '../store/gameStore';
import { getAnySave, getAllStats } from '../utils/storage';
import { storyPackageSummaries } from '../data/index';

export function StartPage() {
  const navigate = useNavigate();
  const { clearStoryPackage } = useGameStore();
  const [canContinue, setCanContinue] = useState<string | null>(null);
  const [showTitle, setShowTitle] = useState(false);
  const [totalStats, setTotalStats] = useState({
    totalStories: 0,
    totalEndings: 0,
    unlockedEndings: 0,
    totalPlays: 0,
    totalFactions: 0,
    totalReputationChanges: 0,
  });

  useEffect(() => {
    clearStoryPackage();
    const save = getAnySave();
    if (save) {
      setCanContinue(save.storyPackageId);
    }
    const allStats = getAllStats();
    const totalEndings = storyPackageSummaries.reduce(
      (sum, s) => sum + s.totalEndings,
      0
    );
    const unlockedEndings = Object.values(allStats).reduce(
      (sum, s) => sum + s.endingsUnlocked.length,
      0
    );
    const totalPlays = Object.values(allStats).reduce(
      (sum, s) => sum + s.totalPlays,
      0
    );
    const totalFactions = storyPackageSummaries.reduce(
      (sum, s) => sum + (s.totalFactions ?? 0),
      0
    );
    const totalReputationChanges = Object.values(allStats).reduce(
      (sum, s) => sum + (s.totalReputationChanges ?? 0),
      0
    );
    setTotalStats({
      totalStories: storyPackageSummaries.length,
      totalEndings,
      unlockedEndings,
      totalPlays,
      totalFactions,
      totalReputationChanges,
    });
    const timer = setTimeout(() => setShowTitle(true), 200);
    return () => clearTimeout(timer);
  }, [clearStoryPackage]);

  const handleStories = () => {
    navigate('/stories');
  };

  const handleContinue = () => {
    if (!canContinue) return;
    navigate('/stories');
  };

  const handleEndings = () => {
    navigate('/endings');
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-8">
      <TerminalWindow
        title="root@glitch-adventure:~/"
        className="max-w-2xl"
      >
        <div className="p-6 sm:p-10 flex flex-col items-center gap-8">
          <div
            className={`transition-all duration-700 ${
              showTitle ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
            }`}
          >
            <div className="text-center">
              <GlitchText
                text="GLITCH://"
                intensity={2}
                className="font-display text-4xl sm:text-6xl text-glitch-green text-shadow-glow-green"
                charGlitch={false}
              />
              <GlitchText
                text="互动叙事档案中心"
                intensity={1.5}
                className="font-display text-2xl sm:text-4xl text-glitch-magenta text-shadow-glow-red block mt-2"
                charGlitch={false}
              />
            </div>
            <p className="text-center text-glitch-blue/70 text-sm sm:text-base mt-6 font-mono text-shadow-glow-blue">
              {'>'} 多剧本档案系统已就绪 / 共 {totalStats.totalStories} 个剧本
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-lg">
            <div className="text-center p-3 border border-glitch-green/20">
              <div className="text-glitch-yellow text-2xl font-display text-shadow-glow-yellow">
                {totalStats.unlockedEndings}
              </div>
              <div className="text-glitch-green/50 text-xs font-mono mt-1">
                已解锁结局
              </div>
            </div>
            <div className="text-center p-3 border border-glitch-green/20">
              <div className="text-glitch-blue text-2xl font-display text-shadow-glow-blue">
                {totalStats.totalEndings}
              </div>
              <div className="text-glitch-green/50 text-xs font-mono mt-1">
                结局总数
              </div>
            </div>
            <div className="text-center p-3 border border-glitch-magenta/20">
              <div className="text-glitch-magenta text-2xl font-display text-shadow-glow-red">
                {totalStats.totalFactions}
              </div>
              <div className="text-glitch-green/50 text-xs font-mono mt-1 flex items-center justify-center gap-1">
                <Shield className="w-3 h-3" /> 势力总数
              </div>
            </div>
            <div className="text-center p-3 border border-glitch-green/20">
              <div className="text-glitch-green text-2xl font-display text-shadow-glow-green">
                {totalStats.totalPlays}
              </div>
              <div className="text-glitch-green/50 text-xs font-mono mt-1">
                总游玩次数
              </div>
            </div>
          </div>
          {totalStats.totalReputationChanges > 0 && (
            <div className="text-center text-xs font-mono text-glitch-magenta/70">
              <Layers className="w-3 h-3 inline mr-1" />
              已记录 {totalStats.totalReputationChanges} 次声望变动
            </div>
          )}

          <div className="text-glitch-green/60 text-sm font-mono max-w-md text-center leading-relaxed">
            欢迎来到互动叙事档案中心。这里收录了多个风格迥异的互动故事，
            每个剧本都有独立的存档系统和结局收集。选择一个故事，开启你的冒险吧。
          </div>

          <div className="flex flex-col gap-3 w-full max-w-sm mt-4">
            <button
              onClick={handleStories}
              className="glitch-btn flex items-center justify-center gap-3 !py-4"
            >
              <Archive className="w-5 h-5" />
              <span>剧本档案中心</span>
            </button>

            {canContinue && (
              <button
                onClick={handleContinue}
                className="glitch-btn !border-glitch-blue !text-glitch-blue hover:!bg-glitch-blue flex items-center justify-center gap-3 !py-3"
                style={{ borderColor: '#00d4ff', color: '#00d4ff' }}
              >
                <Terminal className="w-5 h-5" />
                <span>继续游戏</span>
              </button>
            )}

            <button
              onClick={handleEndings}
              className="glitch-btn !border-glitch-yellow !text-glitch-yellow hover:!bg-glitch-yellow flex items-center justify-center gap-3 !py-3"
              style={{ borderColor: '#ffff00', color: '#ffff00' }}
            >
              <Trophy className="w-5 h-5" />
              <span>结局图鉴</span>
            </button>
          </div>

          <div className="text-xs text-glitch-green/40 font-mono mt-4 flex items-center gap-2">
            <Layers className="w-3 h-3" />
            <span>提示：每个剧本都有独立的存档 | 探索隐藏路线解锁真结局</span>
          </div>
        </div>
      </TerminalWindow>
    </div>
  );
}
