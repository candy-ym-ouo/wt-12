import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, Unlock, Trophy, Star } from 'lucide-react';
import { TerminalWindow } from '../components/TerminalWindow';
import { GlitchText } from '../components/GlitchText';
import { useGameStore } from '../store/gameStore';
import { sampleStory } from '../data/sampleStory';
import { getStats } from '../utils/storage';

export function EndingsPage() {
  const navigate = useNavigate();
  const { setStoryPackage, unlockedEndings, totalPlays, totalEndings } = useGameStore();

  useEffect(() => {
    setStoryPackage(sampleStory);
  }, [setStoryPackage]);

  const endings = sampleStory.endings;
  const stats = getStats();
  const unlockedCount = stats.endingsUnlocked.length;
  const unlockRate = endings.length > 0 ? Math.round((unlockedCount / endings.length) * 100) : 0;

  return (
    <div className="min-h-screen w-full flex flex-col p-4 sm:p-8">
      <div className="w-full max-w-4xl mx-auto mb-6 flex items-center justify-between">
        <button
          onClick={() => navigate('/')}
          className="glitch-btn !py-2 !px-4 flex items-center gap-2 !text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          返回
        </button>
        <GlitchText
          text="结局图鉴"
          intensity={1}
          className="font-display text-2xl sm:text-3xl text-glitch-yellow text-shadow-glow-yellow"
          charGlitch={false}
        />
        <div className="w-24" />
      </div>

      <TerminalWindow title="stats://endings_collection" className="w-full max-w-4xl mx-auto mb-6">
        <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-glitch-green/60 text-xs font-mono mb-2">通关次数</div>
            <div className="text-4xl font-display text-glitch-green text-shadow-glow-green">
              {stats.totalPlays}
            </div>
          </div>
          <div className="text-center">
            <div className="text-glitch-green/60 text-xs font-mono mb-2">解锁结局</div>
            <div className="text-4xl font-display text-glitch-yellow text-shadow-glow-yellow">
              {unlockedCount}/{endings.length}
            </div>
          </div>
          <div className="text-center">
            <div className="text-glitch-green/60 text-xs font-mono mb-2">完成度</div>
            <div className="text-4xl font-display text-glitch-blue text-shadow-glow-blue">
              {unlockRate}%
            </div>
          </div>
        </div>
        <div className="px-6 pb-6">
          <div className="w-full h-3 bg-glitch-bg2 border border-glitch-green/30 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-glitch-green via-glitch-blue to-glitch-magenta transition-all duration-700"
              style={{ width: `${unlockRate}%` }}
            />
          </div>
        </div>
      </TerminalWindow>

      <TerminalWindow title="archive://endings" className="w-full max-w-4xl mx-auto">
        <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {endings.map((ending) => {
            const isUnlocked = stats.endingsUnlocked.includes(ending.id);
            return (
              <div
                key={ending.id}
                className={`relative border-2 p-5 transition-all ${
                  isUnlocked
                    ? 'border-glitch-green bg-glitch-green/5 hover:bg-glitch-green/10'
                    : 'border-glitch-green/20 bg-glitch-bg'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    {isUnlocked ? (
                      <Unlock className="w-5 h-5 text-glitch-green text-shadow-glow-green" />
                    ) : (
                      <Lock className="w-5 h-5 text-glitch-green/30" />
                    )}
                    <Trophy
                      className={`w-5 h-5 ${
                        isUnlocked ? 'text-glitch-yellow text-shadow-glow-yellow' : 'text-glitch-green/20'
                      }`}
                    />
                    {ending.isHidden && isUnlocked && (
                      <Star className="w-5 h-5 text-glitch-magenta text-shadow-glow-red fill-glitch-magenta" />
                    )}
                  </div>
                  {ending.isHidden && (
                    <span
                      className={`text-xs font-mono px-2 py-0.5 border ${
                        isUnlocked
                          ? 'text-glitch-magenta border-glitch-magenta text-shadow-glow-red'
                          : 'text-glitch-green/20 border-glitch-green/20'
                      }`}
                    >
                      HIDDEN
                    </span>
                  )}
                </div>

                {isUnlocked ? (
                  <>
                    <GlitchText
                      text={ending.title}
                      intensity={0.5}
                      className="font-display text-xl text-glitch-green text-shadow-glow-green block mb-3"
                      charGlitch={false}
                    />
                    <p className="text-sm text-glitch-green/70 font-mono leading-relaxed">
                      {ending.description}
                    </p>
                  </>
                ) : (
                  <>
                    <div className="font-display text-xl text-glitch-green/30 mb-3 blur-[2px] select-none">
                      ??? 未解锁 ???
                    </div>
                    <p className="text-sm text-glitch-green/20 font-mono italic blur-[1px] select-none">
                      继续探索以解锁这个结局...
                    </p>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </TerminalWindow>

      <div className="w-full max-w-4xl mx-auto mt-6 text-center text-xs text-glitch-green/40 font-mono">
        提示：探索所有剧情分支，寻找隐藏关键词，可以解锁真结局。
      </div>
    </div>
  );
}
