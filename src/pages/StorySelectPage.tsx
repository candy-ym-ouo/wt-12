import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Book,
  Play,
  Clock,
  Trophy,
  Star,
  Lock,
  Unlock,
  ChevronRight,
  ArrowLeft,
  Save,
  Tag,
  User,
  Zap,
  LayoutGrid,
  Layers,
} from 'lucide-react';
import { TerminalWindow } from '../components/TerminalWindow';
import { GlitchText } from '../components/GlitchText';
import { storyPackageSummaries, getStoryPackage } from '../data/index';
import { hasSave, loadGame, getStats } from '../utils/storage';
import { useGameStore } from '../store/gameStore';
import type { StoryPackageSummary, SaveData } from '../data/types';

const difficultyColors: Record<string, { bg: string; border: string; text: string }> = {
  easy: { bg: 'bg-glitch-green/10', border: 'border-glitch-green', text: 'text-glitch-green' },
  normal: { bg: 'bg-glitch-yellow/10', border: 'border-glitch-yellow', text: 'text-glitch-yellow' },
  hard: { bg: 'bg-glitch-magenta/10', border: 'border-glitch-magenta', text: 'text-glitch-magenta' },
};

const difficultyLabels: Record<string, string> = {
  easy: '简单',
  normal: '普通',
  hard: '困难',
};

interface StoryCardProps {
  story: StoryPackageSummary;
  onClick: () => void;
  isSelected: boolean;
}

function StoryCard({ story, onClick, isSelected }: StoryCardProps) {
  const [saveData, setSaveData] = useState<SaveData | null>(null);
  const [stats, setStats] = useState<{
    totalPlays: number;
    unlockedEndings: number;
  }>({ totalPlays: 0, unlockedEndings: 0 });

  useEffect(() => {
    if (hasSave(story.id)) {
      setSaveData(loadGame(story.id));
    }
    const storyStats = getStats(story.id);
    setStats({
      totalPlays: storyStats.totalPlays,
      unlockedEndings: storyStats.endingsUnlocked.length,
    });
  }, [story.id]);

  const hasProgress = saveData !== null;
  const difficulty = story.difficulty ?? 'normal';
  const color = difficultyColors[difficulty];

  return (
    <div
      onClick={onClick}
      className={`relative border-2 p-5 cursor-pointer transition-all duration-300 ${
        isSelected
          ? 'border-glitch-green bg-glitch-green/10 shadow-[0_0_20px_rgba(0,255,136,0.3)]'
          : 'border-glitch-green/30 bg-glitch-bg/50 hover:border-glitch-green/60 hover:bg-glitch-green/5'
      }`}
    >
      {isSelected && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-glitch-green flex items-center justify-center">
          <ChevronRight className="w-4 h-4 text-glitch-bg" />
        </div>
      )}

      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1">
          <GlitchText
            text={story.title}
            intensity={isSelected ? 1.5 : 0.5}
            className="font-display text-lg text-glitch-green text-shadow-glow-green block"
            charGlitch={false}
          />
          {story.subtitle && (
            <div className="text-glitch-blue/60 text-xs font-mono mt-1">
              {story.subtitle}
            </div>
          )}
        </div>
        <div
          className={`px-2 py-1 text-xs font-mono border ${color.bg} ${color.border} ${color.text}`}
        >
          {difficultyLabels[difficulty]}
        </div>
      </div>

      <p className="text-glitch-green/70 text-sm font-mono mb-4 line-clamp-2 leading-relaxed">
        {story.description}
      </p>

      {story.genre && story.genre.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {story.genre.map((g) => (
            <span
              key={g}
              className="text-xs font-mono px-2 py-0.5 border border-glitch-blue/30 text-glitch-blue/70"
            >
              <Tag className="w-3 h-3 inline mr-1" />
              {g}
            </span>
          ))}
        </div>
      )}

      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-glitch-green/20">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-glitch-yellow/70 text-xs mb-1">
            <Clock className="w-3 h-3" />
            <span>时长</span>
          </div>
          <div className="text-sm font-mono text-glitch-yellow text-shadow-glow-yellow">
            {story.estimatedPlaytime}
          </div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-glitch-blue/70 text-xs mb-1">
            <Trophy className="w-3 h-3" />
            <span>结局</span>
          </div>
          <div className="text-sm font-mono text-glitch-blue text-shadow-glow-blue">
            {stats.unlockedEndings}/{story.totalEndings}
          </div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-glitch-green/70 text-xs mb-1">
            <Layers className="w-3 h-3" />
            <span>章节</span>
          </div>
          <div className="text-sm font-mono text-glitch-green text-shadow-glow-green">
            {story.totalChapters}
          </div>
        </div>
      </div>

      {hasProgress && saveData && (
        <div className="mt-4 pt-3 border-t border-glitch-green/20 flex items-center justify-between">
          <div className="flex items-center gap-2 text-glitch-green/70 text-xs font-mono">
            <Save className="w-3 h-3" />
            <span>
              存档于{' '}
              {new Date(saveData.savedAt).toLocaleString('zh-CN', {
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
          {stats.totalPlays > 0 && (
            <div className="flex items-center gap-1 text-glitch-yellow/70 text-xs font-mono">
              <Zap className="w-3 h-3" />
              <span>{stats.totalPlays} 次通关</span>
            </div>
          )}
        </div>
      )}

      {story.author && (
        <div className="mt-3 flex items-center gap-1.5 text-glitch-green/40 text-xs font-mono">
          <User className="w-3 h-3" />
          <span>{story.author}</span>
        </div>
      )}
    </div>
  );
}

interface StoryDetailProps {
  story: StoryPackageSummary;
  onBack: () => void;
  onNewGame: () => void;
  onContinue: () => void;
}

function StoryDetail({ story, onBack, onNewGame, onContinue }: StoryDetailProps) {
  const [saveData, setSaveData] = useState<SaveData | null>(null);
  const [stats, setStats] = useState<{
    totalPlays: number;
    unlockedEndings: number;
    completedChaptersCount: number;
    completedChapterIds: number[];
  }>({ totalPlays: 0, unlockedEndings: 0, completedChaptersCount: 0, completedChapterIds: [] });

  useEffect(() => {
    if (hasSave(story.id)) {
      setSaveData(loadGame(story.id));
    }
    const storyStats = getStats(story.id);
    setStats({
      totalPlays: storyStats.totalPlays,
      unlockedEndings: storyStats.endingsUnlocked.length,
      completedChaptersCount: storyStats.completedChapters.length,
      completedChapterIds: storyStats.completedChapters,
    });
  }, [story.id]);

  const hasProgress = saveData !== null;
  const unlockRate =
    story.totalEndings > 0 ? Math.round((stats.unlockedEndings / story.totalEndings) * 100) : 0;
  const chapterProgress =
    story.totalChapters > 0 ? Math.round((stats.completedChaptersCount / story.totalChapters) * 100) : 0;
  const difficulty = story.difficulty ?? 'normal';
  const color = difficultyColors[difficulty];
  const fullStory = getStoryPackage(story.id);

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="glitch-btn !py-2 !px-4 flex items-center gap-2 !text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        返回列表
      </button>

      <TerminalWindow
        title={`story://${story.id}/info`}
        className="w-full max-w-3xl mx-auto"
      >
        <div className="p-6 space-y-6">
          <div className="text-center">
            <div
              className={`inline-block px-3 py-1 text-xs font-mono border ${color.bg} ${color.border} ${color.text} mb-3`}
            >
              {difficultyLabels[difficulty]}难度
            </div>
            <GlitchText
              text={story.title}
              intensity={2}
              className="font-display text-3xl sm:text-4xl text-glitch-green text-shadow-glow-green"
            />
            {story.subtitle && (
              <div className="text-glitch-blue/70 text-sm font-mono mt-2">
                {story.subtitle}
              </div>
            )}
          </div>

          {story.author && (
            <div className="flex items-center justify-center gap-2 text-glitch-green/50 text-sm font-mono">
              <User className="w-4 h-4" />
              <span>{story.author}</span>
            </div>
          )}

          <p className="text-glitch-green/80 text-base font-mono leading-relaxed text-center max-w-2xl mx-auto">
            {story.description}
          </p>

          {story.genre && story.genre.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2">
              {story.genre.map((g) => (
                <span
                  key={g}
                  className="text-sm font-mono px-3 py-1 border border-glitch-blue/40 text-glitch-blue/80"
                >
                  <Tag className="w-3 h-3 inline mr-1.5" />
                  {g}
                </span>
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-glitch-green/20">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 text-glitch-green/60 text-xs font-mono mb-2">
                <Clock className="w-4 h-4" />
                <span>预计时长</span>
              </div>
              <div className="text-2xl font-display text-glitch-green text-shadow-glow-green">
                {story.estimatedPlaytime}
              </div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 text-glitch-yellow/60 text-xs font-mono mb-2">
                <Trophy className="w-4 h-4" />
                <span>结局解锁</span>
              </div>
              <div className="text-2xl font-display text-glitch-yellow text-shadow-glow-yellow">
                {stats.unlockedEndings}/{story.totalEndings}
              </div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 text-glitch-blue/60 text-xs font-mono mb-2">
                <Layers className="w-4 h-4" />
                <span>章节进度</span>
              </div>
              <div className="text-2xl font-display text-glitch-blue text-shadow-glow-blue">
                {stats.completedChaptersCount}/{story.totalChapters}
              </div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 text-glitch-magenta/60 text-xs font-mono mb-2">
                <Zap className="w-4 h-4" />
                <span>通关次数</span>
              </div>
              <div className="text-2xl font-display text-glitch-magenta text-shadow-glow-red">
                {stats.totalPlays}
              </div>
            </div>
          </div>

          {(unlockRate > 0 || chapterProgress > 0) && (
            <div className="space-y-3 pt-2">
              {unlockRate > 0 && (
                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-glitch-yellow/70">结局完成度</span>
                    <span className="text-glitch-yellow">{unlockRate}%</span>
                  </div>
                  <div className="w-full h-2 bg-glitch-bg2 border border-glitch-yellow/30">
                    <div
                      className="h-full bg-gradient-to-r from-glitch-yellow to-glitch-magenta transition-all duration-500"
                      style={{ width: `${unlockRate}%` }}
                    />
                  </div>
                </div>
              )}
              {chapterProgress > 0 && (
                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-glitch-blue/70">章节完成度</span>
                    <span className="text-glitch-blue">{chapterProgress}%</span>
                  </div>
                  <div className="w-full h-2 bg-glitch-bg2 border border-glitch-blue/30">
                    <div
                      className="h-full bg-gradient-to-r from-glitch-blue to-glitch-green transition-all duration-500"
                      style={{ width: `${chapterProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {fullStory && fullStory.chapters.length > 0 && (
            <div className="pt-4 border-t border-glitch-green/20">
              <h3 className="font-display text-lg text-glitch-green text-shadow-glow-green mb-4 flex items-center gap-2">
                <Book className="w-5 h-5" />
                章节列表
              </h3>
              <div className="space-y-3">
                {fullStory.chapters.map((chapter, index) => {
                  const isUnlocked = index === 0 || stats.completedChapterIds.includes(chapter.id);
                  return (
                    <div
                      key={chapter.id}
                      className={`p-4 border-2 ${
                        isUnlocked
                          ? 'border-glitch-green/40 bg-glitch-green/5'
                          : 'border-glitch-green/10 bg-glitch-bg'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {isUnlocked ? (
                              <Unlock className="w-4 h-4 text-glitch-green" />
                            ) : (
                              <Lock className="w-4 h-4 text-glitch-green/30" />
                            )}
                            <span
                              className={`font-display ${
                                isUnlocked
                                  ? 'text-glitch-green text-shadow-glow-green'
                                  : 'text-glitch-green/40'
                              }`}
                            >
                              {chapter.title}
                            </span>
                            {stats.completedChapterIds.includes(chapter.id) && (
                              <Star className="w-4 h-4 text-glitch-yellow fill-glitch-yellow" />
                            )}
                          </div>
                          {chapter.subtitle && (
                            <div className="text-xs font-mono text-glitch-blue/50 mb-2 ml-6">
                              {chapter.subtitle}
                            </div>
                          )}
                          {isUnlocked && chapter.description && (
                            <p className="text-sm text-glitch-green/60 font-mono ml-6 leading-relaxed">
                              {chapter.description}
                            </p>
                          )}
                        </div>
                        {chapter.estimatedDuration && isUnlocked && (
                          <div className="flex items-center gap-1 text-xs font-mono text-glitch-yellow/70">
                            <Clock className="w-3 h-3" />
                            <span>{chapter.estimatedDuration}</span>
                          </div>
                        )}
                      </div>
                      {chapter.themes && chapter.themes.length > 0 && isUnlocked && (
                        <div className="flex flex-wrap gap-1.5 mt-3 ml-6">
                          {chapter.themes.map((theme) => (
                            <span
                              key={theme}
                              className="text-xs font-mono px-2 py-0.5 border border-glitch-blue/20 text-glitch-blue/60"
                            >
                              {theme}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-glitch-green/20">
            <button
              onClick={onNewGame}
              className="glitch-btn flex-1 !py-4 flex items-center justify-center gap-2 !text-base"
            >
              <Play className="w-5 h-5" />
              <span>开始新游戏</span>
            </button>
            {hasProgress && (
              <button
                onClick={onContinue}
                className="glitch-btn flex-1 !border-glitch-blue !text-glitch-blue hover:!bg-glitch-blue !py-4 flex items-center justify-center gap-2 !text-base"
                style={{ borderColor: '#00d4ff', color: '#00d4ff' }}
              >
                <Save className="w-5 h-5" />
                <span>继续游戏</span>
              </button>
            )}
          </div>
        </div>
      </TerminalWindow>
    </div>
  );
}

export function StorySelectPage() {
  const navigate = useNavigate();
  const { setStoryPackage, startNewGame, continueGame, clearStoryPackage } = useGameStore();
  const [selectedStoryId, setSelectedStoryId] = useState<string | null>(null);

  useEffect(() => {
    clearStoryPackage();
  }, [clearStoryPackage]);

  const handleSelectStory = (storyId: string) => {
    setSelectedStoryId(storyId);
  };

  const handleBack = () => {
    setSelectedStoryId(null);
  };

  const handleNewGame = () => {
    if (!selectedStoryId) return;
    const story = getStoryPackage(selectedStoryId);
    if (!story) return;
    setStoryPackage(story);
    startNewGame();
    navigate('/game');
  };

  const handleContinue = () => {
    if (!selectedStoryId) return;
    const story = getStoryPackage(selectedStoryId);
    if (!story) return;
    setStoryPackage(story);
    if (continueGame(selectedStoryId)) {
      navigate('/game');
    }
  };

  const selectedStory = selectedStoryId
    ? storyPackageSummaries.find((s) => s.id === selectedStoryId)
    : null;

  return (
    <div className="min-h-screen w-full flex flex-col p-4 sm:p-8">
      <div className="w-full max-w-5xl mx-auto mb-6 flex items-center justify-between">
        <button
          onClick={() => navigate('/')}
          className="glitch-btn !py-2 !px-4 flex items-center gap-2 !text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          返回主菜单
        </button>
        <GlitchText
          text="剧本档案中心"
          intensity={1.5}
          className="font-display text-2xl sm:text-3xl text-glitch-magenta text-shadow-glow-red"
          charGlitch={false}
        />
        <div className="w-24" />
      </div>

      {selectedStory ? (
        <StoryDetail
          story={selectedStory}
          onBack={handleBack}
          onNewGame={handleNewGame}
          onContinue={handleContinue}
        />
      ) : (
        <>
          <TerminalWindow
            title="archive://story_packages"
            className="w-full max-w-5xl mx-auto mb-6"
          >
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <LayoutGrid className="w-6 h-6 text-glitch-green" />
                  <h2 className="font-display text-xl text-glitch-green text-shadow-glow-green">
                    可用剧本 ({storyPackageSummaries.length})
                  </h2>
                </div>
                <div className="text-xs font-mono text-glitch-green/50">
                  点击卡片查看详情
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {storyPackageSummaries.map((story) => (
                  <StoryCard
                    key={story.id}
                    story={story}
                    onClick={() => handleSelectStory(story.id)}
                    isSelected={false}
                  />
                ))}
              </div>
            </div>
          </TerminalWindow>
        </>
      )}

      <div className="w-full max-w-5xl mx-auto mt-6 text-center text-xs text-glitch-green/40 font-mono">
        每个剧本都有独立的存档、进度和结局收集系统
      </div>
    </div>
  );
}
