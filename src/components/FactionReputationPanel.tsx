import { useGameStore } from '../store/gameStore';
import type { Faction } from '../data/types';
import { Shield, TrendingUp, Target } from 'lucide-react';

interface FactionReputationBarProps {
  faction: Faction;
  value: number;
}

function getReputationLevel(value: number): {
  label: string;
  color: string;
} {
  if (value >= 75) return { label: '崇拜', color: '#00ff66' };
  if (value >= 50) return { label: '友好', color: '#88ff99' };
  if (value >= 25) return { label: '中立', color: '#00d4ff' };
  if (value >= 0) return { label: '冷淡', color: '#ffaa00' };
  if (value >= -25) return { label: '不友善', color: '#ff6600' };
  if (value >= -50) return { label: '敌对', color: '#ff3355' };
  return { label: '仇恨', color: '#ff0055' };
}

function FactionReputationBar({ faction, value }: FactionReputationBarProps) {
  const minVal = faction.minReputation ?? -100;
  const maxVal = faction.maxReputation ?? 100;
  const level = getReputationLevel(value);

  const positiveWidth = value >= 0 ? (value / maxVal) * 50 : 0;
  const negativeWidth = value < 0 ? (Math.abs(value) / Math.abs(minVal)) * 50 : 0;

  return (
    <div className="mb-3 last:mb-0">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <Shield
            className="w-3.5 h-3.5"
            style={{ color: faction.color ?? level.color }}
          />
          <span
            className="font-mono text-xs sm:text-sm"
            style={{
              color: faction.color ?? level.color,
              textShadow: `0 0 6px ${faction.color ?? level.color}40`,
            }}
          >
            {faction.shortName ?? faction.name}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className="font-mono text-xs"
            style={{ color: level.color }}
          >
            {level.label}
          </span>
          <span
            className="font-mono text-xs text-glitch-green/70"
          >
            [{value >= 0 ? '+' : ''}{value}]
          </span>
        </div>
      </div>
      <div className="relative w-full h-2 bg-glitch-bg2 border border-glitch-green/20 overflow-hidden">
        <div className="absolute inset-0 flex">
          <div
            className="h-full transition-all duration-500"
            style={{
              width: '50%',
              background: 'linear-gradient(to right, #ff005530, #ffaa0020)',
            }}
          />
          <div
            className="h-full transition-all duration-500"
            style={{
              width: '50%',
              background: 'linear-gradient(to right, #00d4ff20, #00ff6630)',
            }}
          />
        </div>
        <div className="absolute top-0 bottom-0 left-1/2 w-px bg-glitch-green/40" />
        {value < 0 && (
          <div
            className="absolute top-0 bottom-0 transition-all duration-500"
            style={{
              right: '50%',
              width: `${negativeWidth}%`,
              background: `linear-gradient(to left, ${level.color}, ${level.color}90)`,
              boxShadow: `0 0 8px ${level.color}60`,
            }}
          />
        )}
        {value > 0 && (
          <div
            className="absolute top-0 bottom-0 transition-all duration-500"
            style={{
              left: '50%',
              width: `${positiveWidth}%`,
              background: `linear-gradient(to right, ${level.color}90, ${level.color})`,
              boxShadow: `0 0 8px ${level.color}60`,
            }}
          />
        )}
      </div>
    </div>
  );
}

interface FactionReputationPanelProps {
  compact?: boolean;
}

export function FactionReputationPanel({ compact = false }: FactionReputationPanelProps) {
  const storyPackage = useGameStore((s) => s.storyPackage);
  const reputation = useGameStore((s) => s.reputation);
  const calculateEndingWeights = useGameStore((s) => s.calculateEndingWeights);
  const getPredictedEnding = useGameStore((s) => s.getPredictedEnding);

  if (!storyPackage?.factions || storyPackage.factions.length === 0) {
    return null;
  }

  const weights = calculateEndingWeights();
  const predictedEndingId = getPredictedEnding();
  const predictedEnding = predictedEndingId
    ? storyPackage.endings.find((e) => e.id === predictedEndingId)
    : null;

  return (
    <div className="w-full">
      {!compact && (
        <div className="flex items-center gap-2 mb-3">
          <Target className="w-4 h-4 text-glitch-magenta" />
          <h3 className="font-display text-sm text-glitch-magenta text-shadow-glow-red">
            势力声望
          </h3>
        </div>
      )}
      <div className="space-y-2">
        {storyPackage.factions.map((faction) => (
          <FactionReputationBar
            key={faction.id}
            faction={faction}
            value={reputation[faction.id] ?? faction.initialReputation}
          />
        ))}
      </div>

      {Object.keys(weights).length > 0 && !compact && (
        <div className="mt-4 pt-3 border-t border-glitch-magenta/20">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-glitch-yellow" />
            <h3 className="font-display text-sm text-glitch-yellow text-shadow-glow-yellow">
              结局倾向预测
            </h3>
          </div>
          <div className="space-y-2">
            {Object.entries(weights)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 3)
              .map(([endingId, weight]) => {
                const ending = storyPackage.endings.find((e) => e.id === endingId);
                const maxWeight = Math.max(...Object.values(weights));
                const percent = maxWeight > 0 ? (weight / maxWeight) * 100 : 0;
                const isPredicted = endingId === predictedEndingId;
                return (
                  <div key={endingId}>
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`font-mono text-xs ${
                          isPredicted
                            ? 'text-glitch-yellow text-shadow-glow-yellow'
                            : 'text-glitch-green/70'
                        }`}
                      >
                        {isPredicted && '★ '}
                        {ending?.title ?? endingId}
                      </span>
                      <span className="font-mono text-xs text-glitch-green/50">
                        {weight.toFixed(1)}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-glitch-bg2 border border-glitch-green/20">
                      <div
                        className="h-full transition-all duration-500"
                        style={{
                          width: `${percent}%`,
                          background: isPredicted
                            ? 'linear-gradient(to right, #ffff00, #ff00ff)'
                            : '#00ff6660',
                          boxShadow: isPredicted ? '0 0 6px #ffff0080' : 'none',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
          {predictedEnding && (
            <div className="mt-3 text-center text-xs font-mono text-glitch-yellow/70 animate-pulse">
              当前最可能结局：{predictedEnding.title}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
