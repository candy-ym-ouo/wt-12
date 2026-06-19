import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Lock,
  Unlock,
  Trophy,
  Star,
  ChevronDown,
  Book,
  Layers,
  Zap,
  LayoutGrid,
} from 'lucide-react';
import { TerminalWindow } from '../components/TerminalWindow';
import { GlitchText } from '../components/GlitchText';
import { useGameStore } from '../store/gameStore';
import { storyPackageSummaries, getStoryPackage } from '../data/index';
import { getStats, getAllStats } from '../utils/storage';
import type { StoryPackageSummary, GameStats, AllStats } from '../data/types';

interface StoryTabProps {
  story: StoryPackageSummary;
  isSelected: boolean;
  onClick: () => void;
  stats: GameStats;
}

function StoryTab({ story, isSelected, onClick, stats }: StoryTabProps) {
  const unlockedCount = stats.endingsUnlocked.length;
  const totalEndings = story.totalEndings;
  const unlockRate = totalEndings > 0 ? Math.round((unlockedCount / totalEndings) * 100) : 0;

  return (
    <button
      onClick={onClick}
      className={`p-3 border-2 text-left transition-all ${
        isSelected
          ? 'border-glitch-yellow bg-glitch-yellow/10'
          : 'border-glitch-green/20 bg-glitch-bg hover:border-glitch-green/40'
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1">
          <div
            className={`font-display text-sm ${
              isSelected
                ? 'text-glitch-yellow text-shadow-glow-yellow'
                : 'text-glitch-green/80'
            }`}
          >
            {story.title}
          </div>
          {story.subtitle && (
            <div className="text-xs font-mono text-glitch-blue/50 mt-0.5">
              {story.subtitle}
            </div>
          )}
        </div>
        {isSelected && (
          <ChevronDown className="w-4 h-4 text-glitch-yellow flex-shrink-0 mt-1" />
        )}
      </div>
      <div className="flex items-center gap-3 text-xs font-mono">
        <div className="flex items-center gap-1 text-glitch-yellow/70">
          <Trophy className="w-3 h-3" />
          <span>
            {unlockedCount}/{totalEndings}
          </span>
        </div>
        <div className="flex items-center gap-1 text-glitch-blue/70">
          <Zap className="w-3 h-3" />
          <span>{stats.totalPlays} 次</span>
        </div>
        <div className="flex-1 h-1.5 bg-glitch-bg2 border border-glitch-green/20">
          <div
            className={`h-full transition-all ${
              isSelected
                ? 'bg-gradient-to-r from-glitch-yellow to-glitch-magenta'
                : 'bg-glitch-green/50'
            }`}
            style={{ width: `${unlockRate}%` }}
          />
        </div>
      </div>
    </button>
  );
}

export function EndingsPage() {
  const navigate = useNavigate();
  const { setStoryPackage, clearStoryPackage } = useGameStore();
  const [selectedStoryId, setSelectedStoryId] = useState<string>(
    storyPackageSummaries[0]?.id ?? ''
  );
  const [allStats, setAllStats] = useState<AllStats>({});

  useEffect(() => {
    clearStoryPackage();
    setAllStats(getAllStats());
  }, [clearStoryPackage]);

  useEffect(() => {
    if (selectedStoryId) {
      const story = getStoryPackage(selectedStoryId);
      if (story) {
        setStoryPackage(story);
      }
    }
  }, [selectedStoryId, setStoryPackage]);

  const selectedStory = selectedStoryId
    ? getStoryPackage(selectedStoryId)
    : undefined;
  const selectedStats = selectedStoryId
    ? getStats(selectedStoryId)
    : null;

  const totalEndingsAll = storyPackageSummaries.reduce(
    (sum, s) => sum + s.totalEndings,
    0
  );
  const totalUnlockedAll = Object.values(allStats).reduce(
    (sum, s) => sum + s.endingsUnlocked.length,
    0
  );
  const totalPlaysAll = Object.values(allStats).reduce(
    (sum, s) => sum + s.totalPlays,
    0
  );
  const overallRate =
    totalEndingsAll > 0 ? Math.round((totalUnlockedAll / totalEndingsAll) * 100) : 0;

  if (!selectedStory || !selectedStats) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <GlitchText
          text="加载中..."
          intensity={2}
          className="text-2xl text-glitch-green"
        />
      </div>
    );
  }

  const endings = selectedStory.endings;
  const unlockedCount = selectedStats.endingsUnlocked.length;
  const unlockRate =
    endings.length > 0 ? Math.round((unlockedCount / endings.length) * 100) : 0;

  return (
    <div className="min-h-screen w-full flex flex-col p-4 sm:p-8">
      <div className="w-full max-w-5xl mx-auto mb-6 flex items-center justify-between">
        <button
          onClick={() => navigate('/')}
          className="glitch-btn !py-2 !px-4 flex items-center gap-2 !text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          返回
        </button>
        <GlitchText
          text="结局图鉴"
          intensity={1.5}
          className="font-display text-2xl sm:text-3xl text-glitch-yellow text-shadow-glow-yellow"
          charGlitch={false}
        />
        <div className="w-24" />
      </div>

      <TerminalWindow
        title="stats://all_endings_collection"
        className="w-full max-w-5xl mx-auto mb-6"
      >
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <LayoutGrid className="w-5 h-5 text-glitch-magenta" />
            <h3 className="font-display text-lg text-glitch-magenta text-shadow-glow-red">
              总体收集进度
            </h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-glitch-green/60 text-xs font-mono mb-2">
                剧本总数
              </div>
              <div className="text-3xl font-display text-glitch-green text-shadow-glow-green">
                {storyPackageSummaries.length}
              </div>
            </div>
            <div className="text-center">
              <div className="text-glitch-green/60 text-xs font-mono mb-2">
                总通关次数
              </div>
              <div className="text-3xl font-display text-glitch-green text-shadow-glow-green">
                {totalPlaysAll}
              </div>
            </div>
            <div className="text-center">
              <div className="text-glitch-yellow/60 text-xs font-mono mb-2">
                结局解锁
              </div>
              <div className="text-3xl font-display text-glitch-yellow text-shadow-glow-yellow">
                {totalUnlockedAll}/{totalEndingsAll}
              </div>
            </div>
            <div className="text-center">
              <div className="text-glitch-magenta/60 text-xs font-mono mb-2">
                总完成度
              </div>
              <div className="text-3xl font-display text-glitch-magenta text-shadow-glow-red">
                {overallRate}%
              </div>
            </div>
          </div>
          <div className="w-full h-3 bg-glitch-bg2 border border-glitch-magenta/30 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-glitch-green via-glitch-yellow to-glitch-magenta transition-all duration-700"
              style={{ width: `${overallRate}%` }}
            />
          </div>
        </div>
      </TerminalWindow>

      <div className="w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <TerminalWindow
            title="stories://select"
            className="w-full"
          >
            <div className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <Book className="w-4 h-4 text-glitch-blue" />
                <h3 className="font-display text-sm text-glitch-blue text-shadow-glow-blue">
                  选择剧本
                </h3>
              </div>
              <div className="space-y-2">
                {storyPackageSummaries.map((story) => (
                  <StoryTab
                    key={story.id}
                    story={story}
                    isSelected={selectedStoryId === story.id}
                    onClick={() => setSelectedStoryId(story.id)}
                    stats={allStats[story.id] ?? {
                      storyPackageId: story.id,
                      totalPlays: 0,
                      endingsUnlocked: [],
                      totalEndings: story.totalEndings,
                      completedChapters: [],
                      totalPlayTime: 0,
                    }}
                  />
                ))}
              </div>
            </div>
          </TerminalWindow>
        </div>

        <div className="lg:col-span-3 space-y-6">
          <TerminalWindow
            title={`stats://${selectedStory.id}/endings`}
            className="w-full"
          >
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1">
                  <GlitchText
                    text={selectedStory.title}
                    intensity={1}
                    className="font-display text-xl text-glitch-green text-shadow-glow-green"
                    charGlitch={false}
                  />
                  {selectedStory.subtitle && (
                    <div className="text-xs font-mono text-glitch-blue/60 mt-1">
                      {selectedStory.subtitle}
                    </div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-glitch-green/60 text-xs font-mono mb-2">
                    通关次数
                  </div>
                  <div className="text-2xl font-display text-glitch-green text-shadow-glow-green">
                    {selectedStats.totalPlays}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-glitch-yellow/60 text-xs font-mono mb-2">
                    解锁结局
                  </div>
                  <div className="text-2xl font-display text-glitch-yellow text-shadow-glow-yellow">
                    {unlockedCount}/{endings.length}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-glitch-blue/60 text-xs font-mono mb-2">
                    完成章节
                  </div>
                  <div className="text-2xl font-display text-glitch-blue text-shadow-glow-blue">
                    {selectedStats.completedChapters.length}/
                    {selectedStory.chapters.length}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-glitch-magenta/60 text-xs font-mono mb-2">
                    完成度
                  </div>
                  <div className="text-2xl font-display text-glitch-magenta text-shadow-glow-red">
                    {unlockRate}%
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <div className="w-full h-2 bg-glitch-bg2 border border-glitch-green/30">
                  <div
                    className="h-full bg-gradient-to-r from-glitch-green via-glitch-blue to-glitch-magenta transition-all duration-700"
                    style={{ width: `${unlockRate}%` }}
                  />
                </div>
              </div>
            </div>
          </TerminalWindow>

          <TerminalWindow
            title={`archive://${selectedStory.id}/endings`}
            className="w-full"
          >
            <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {endings.map((ending) => {
                const isUnlocked = selectedStats.endingsUnlocked.includes(
                  ending.id
                );
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
                            isUnlocked
                              ? 'text-glitch-yellow text-shadow-glow-yellow'
                              : 'text-glitch-green/20'
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
        </div>
      </div>

      <div className="w-full max-w-5xl mx-auto mt-6 text-center text-xs text-glitch-green/40 font-mono">
        提示：探索所有剧情分支，寻找隐藏关键词，可以解锁真结局。每个剧本的结局独立统计。
      </div>
    </div>
  );
}

