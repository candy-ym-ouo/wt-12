import { useState } from 'react';
import {
  Book,
  ChevronDown,
  ChevronUp,
  Lock,
  Unlock,
  Clock,
  Tag,
  Star,
  CheckCircle,
} from 'lucide-react';
import { TerminalWindow } from './TerminalWindow';
import type { ChapterMetadata, StoryPackage } from '../data/types';
import { getStats } from '../utils/storage';

interface ChapterMetadataPanelProps {
  storyPackage: StoryPackage;
  currentChapter: number;
  onClose?: () => void;
}

export function ChapterMetadataPanel({
  storyPackage,
  currentChapter,
  onClose,
}: ChapterMetadataPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const stats = getStats(storyPackage.id);
  const completedChapters = stats.completedChapters;

  const currentChapterData = storyPackage.chapters.find((c) => c.id === currentChapter);

  return (
    <div className="w-full">
      <TerminalWindow
        title={`chapter://metadata/ch.${currentChapter}`}
        className="w-full"
      >
        <div className="p-4">
          <div
            className="flex items-center justify-between cursor-pointer"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <div className="flex items-center gap-3">
              <Book className="w-5 h-5 text-glitch-blue" />
              <div>
                {currentChapterData ? (
                  <>
                    <div className="font-display text-glitch-green text-shadow-glow-green">
                      {currentChapterData.title}
                    </div>
                    {currentChapterData.subtitle && (
                      <div className="text-xs font-mono text-glitch-blue/60">
                        {currentChapterData.subtitle}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="font-display text-glitch-green">
                    第 {currentChapter} 章
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-xs font-mono text-glitch-yellow/70">
                {completedChapters.length}/{storyPackage.chapters.length} 章完成
              </div>
              {isExpanded ? (
                <ChevronUp className="w-5 h-5 text-glitch-green/60" />
              ) : (
                <ChevronDown className="w-5 h-5 text-glitch-green/60" />
              )}
            </div>
          </div>

          {currentChapterData && currentChapterData.description && !isExpanded && (
            <p className="mt-3 text-sm text-glitch-green/70 font-mono leading-relaxed">
              {currentChapterData.description}
            </p>
          )}

          {currentChapterData && currentChapterData.estimatedDuration && !isExpanded && (
            <div className="mt-2 flex items-center gap-1.5 text-xs font-mono text-glitch-yellow/60">
              <Clock className="w-3.5 h-3.5" />
              <span>预计时长：{currentChapterData.estimatedDuration}</span>
            </div>
          )}

          {isExpanded && (
            <div className="mt-4 pt-4 border-t border-glitch-green/20 space-y-3">
              <h4 className="font-display text-glitch-blue text-shadow-glow-blue text-sm mb-3">
                章节进度
              </h4>
              {storyPackage.chapters.map((chapter) => {
                const isCompleted = completedChapters.includes(chapter.id);
                const isCurrent = chapter.id === currentChapter;
                const isUnlocked =
                  chapter.id === 1 || completedChapters.includes(chapter.id - 1);

                return (
                  <div
                    key={chapter.id}
                    className={`p-3 border-2 transition-all ${
                      isCurrent
                        ? 'border-glitch-green bg-glitch-green/10'
                        : isCompleted
                          ? 'border-glitch-yellow/40 bg-glitch-yellow/5'
                          : 'border-glitch-green/10 bg-glitch-bg/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2 flex-1">
                        {isCompleted ? (
                          <CheckCircle className="w-4 h-4 text-glitch-yellow mt-0.5 flex-shrink-0" />
                        ) : isUnlocked ? (
                          <Unlock className="w-4 h-4 text-glitch-green mt-0.5 flex-shrink-0" />
                        ) : (
                          <Lock className="w-4 h-4 text-glitch-green/30 mt-0.5 flex-shrink-0" />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-display text-sm ${
                                isCompleted
                                  ? 'text-glitch-yellow text-shadow-glow-yellow'
                                  : isCurrent
                                    ? 'text-glitch-green text-shadow-glow-green'
                                    : isUnlocked
                                      ? 'text-glitch-green/80'
                                      : 'text-glitch-green/30'
                              }`}
                            >
                              {chapter.title}
                            </span>
                            {isCurrent && (
                              <span className="text-xs font-mono px-2 py-0.5 bg-glitch-green/20 text-glitch-green border border-glitch-green/40">
                                当前
                              </span>
                            )}
                          </div>
                          {chapter.subtitle && isUnlocked && (
                            <div className="text-xs font-mono text-glitch-blue/50 mt-1">
                              {chapter.subtitle}
                            </div>
                          )}
                          {isUnlocked && chapter.description && (
                            <p className="text-xs text-glitch-green/50 font-mono mt-2 leading-relaxed">
                              {chapter.description}
                            </p>
                          )}
                          {isUnlocked && chapter.themes && chapter.themes.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {chapter.themes.map((theme) => (
                                <span
                                  key={theme}
                                  className="text-xs font-mono px-1.5 py-0.5 border border-glitch-blue/20 text-glitch-blue/50"
                                >
                                  <Tag className="w-2.5 h-2.5 inline mr-1" />
                                  {theme}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      {isUnlocked && chapter.estimatedDuration && (
                        <div className="flex items-center gap-1 text-xs font-mono text-glitch-yellow/50 flex-shrink-0">
                          <Clock className="w-3 h-3" />
                          <span>{chapter.estimatedDuration}</span>
                        </div>
                      )}
                    </div>
                    {isCompleted && (
                      <div className="mt-2 ml-6 flex items-center gap-1.5 text-xs font-mono text-glitch-yellow/70">
                        <Star className="w-3 h-3 fill-glitch-yellow" />
                        <span>章节已完成</span>
                      </div>
                    )}
                  </div>
                );
              })}

              <div className="mt-4 pt-3 border-t border-glitch-green/20">
                <div className="flex justify-between text-xs font-mono mb-1.5">
                  <span className="text-glitch-blue/70">总体进度</span>
                  <span className="text-glitch-blue">
                    {storyPackage.chapters.length > 0
                      ? Math.round(
                          (completedChapters.length / storyPackage.chapters.length) * 100
                        )
                      : 0}
                    %
                  </span>
                </div>
                <div className="w-full h-2 bg-glitch-bg2 border border-glitch-blue/30">
                  <div
                    className="h-full bg-gradient-to-r from-glitch-blue via-glitch-green to-glitch-yellow transition-all duration-500"
                    style={{
                      width: `${
                        storyPackage.chapters.length > 0
                          ? (completedChapters.length / storyPackage.chapters.length) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </TerminalWindow>
    </div>
  );
}
