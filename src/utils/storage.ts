import type { SaveData, GameStats, AllStats, FactionReputation, FactionStats } from '../data/types';

const SAVE_KEY_PREFIX = 'glitch_adventure_save_';
const ALL_STATS_KEY = 'glitch_adventure_all_stats';

function getSaveKey(storyPackageId: string): string {
  return `${SAVE_KEY_PREFIX}${storyPackageId}`;
}

export function saveGame(data: SaveData): void {
  try {
    const key = getSaveKey(data.storyPackageId);
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save game:', e);
  }
}

export function loadGame(storyPackageId: string): SaveData | null {
  try {
    const key = getSaveKey(storyPackageId);
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SaveData & { reputation?: FactionReputation };
    if (!parsed.reputation) {
      parsed.reputation = {};
    }
    return parsed;
  } catch (e) {
    console.error('Failed to load game:', e);
    return null;
  }
}

export function hasSave(storyPackageId: string): boolean {
  const key = getSaveKey(storyPackageId);
  return localStorage.getItem(key) !== null;
}

export function getAnySave(): { storyPackageId: string; save: SaveData } | null {
  const keys = Object.keys(localStorage);
  for (const key of keys) {
    if (key.startsWith(SAVE_KEY_PREFIX)) {
      const storyPackageId = key.replace(SAVE_KEY_PREFIX, '');
      const save = loadGame(storyPackageId);
      if (save) {
        return { storyPackageId, save };
      }
    }
  }
  return null;
}

export function deleteSave(storyPackageId: string): void {
  const key = getSaveKey(storyPackageId);
  localStorage.removeItem(key);
}

export function deleteAllSaves(): void {
  const keys = Object.keys(localStorage);
  for (const key of keys) {
    if (key.startsWith(SAVE_KEY_PREFIX)) {
      localStorage.removeItem(key);
    }
  }
}

export function getAllStats(): AllStats {
  try {
    const raw = localStorage.getItem(ALL_STATS_KEY);
    if (!raw) {
      return {};
    }
    return JSON.parse(raw) as AllStats;
  } catch {
    return {};
  }
}

export function getStats(storyPackageId: string): GameStats {
  const allStats = getAllStats();
  return (
    allStats[storyPackageId] ?? {
      storyPackageId,
      totalPlays: 0,
      endingsUnlocked: [],
      totalEndings: 0,
      completedChapters: [],
      totalPlayTime: 0,
      factionStats: {},
      totalReputationChanges: 0,
    }
  );
}

export function updateStats(
  storyPackageId: string,
  updates: Partial<GameStats>
): GameStats {
  const allStats = getAllStats();
  const current = getStats(storyPackageId);
  const merged: GameStats = {
    ...current,
    ...updates,
    storyPackageId,
    endingsUnlocked: updates.endingsUnlocked ?? current.endingsUnlocked,
    completedChapters: updates.completedChapters ?? current.completedChapters,
  };
  allStats[storyPackageId] = merged;
  localStorage.setItem(ALL_STATS_KEY, JSON.stringify(allStats));
  return merged;
}

export function unlockEnding(storyPackageId: string, endingId: string): string[] {
  const stats = getStats(storyPackageId);
  if (!stats.endingsUnlocked.includes(endingId)) {
    stats.endingsUnlocked.push(endingId);
    updateStats(storyPackageId, stats);
  }
  return stats.endingsUnlocked;
}

export function incrementPlayCount(storyPackageId: string): number {
  const stats = getStats(storyPackageId);
  stats.totalPlays += 1;
  updateStats(storyPackageId, stats);
  return stats.totalPlays;
}

export function setTotalEndings(storyPackageId: string, count: number): void {
  updateStats(storyPackageId, { totalEndings: count });
}

export function completeChapter(storyPackageId: string, chapterId: number): number[] {
  const stats = getStats(storyPackageId);
  if (!stats.completedChapters.includes(chapterId)) {
    stats.completedChapters.push(chapterId);
    updateStats(storyPackageId, stats);
  }
  return stats.completedChapters;
}

export function addPlayTime(storyPackageId: string, seconds: number): number {
  const stats = getStats(storyPackageId);
  stats.totalPlayTime += seconds;
  updateStats(storyPackageId, stats);
  return stats.totalPlayTime;
}

export function initializeFactionStats(
  storyPackageId: string,
  factionId: string,
  initialReputation: number
): FactionStats {
  const stats = getStats(storyPackageId);
  if (!stats.factionStats) {
    stats.factionStats = {};
  }
  if (!stats.factionStats[factionId]) {
    stats.factionStats[factionId] = {
      maxReputation: initialReputation,
      minReputation: initialReputation,
      totalChanges: 0,
    };
    updateStats(storyPackageId, stats);
  }
  return stats.factionStats[factionId];
}

export function updateFactionReputationStats(
  storyPackageId: string,
  factionId: string,
  currentReputation: number,
  changeAmount: number
): FactionStats | null {
  const stats = getStats(storyPackageId);
  if (!stats.factionStats) {
    stats.factionStats = {};
  }
  if (!stats.factionStats[factionId]) {
    stats.factionStats[factionId] = {
      maxReputation: currentReputation,
      minReputation: currentReputation,
      totalChanges: 0,
    };
  }
  const factionStat = stats.factionStats[factionId];
  factionStat.maxReputation = Math.max(factionStat.maxReputation, currentReputation);
  factionStat.minReputation = Math.min(factionStat.minReputation, currentReputation);
  factionStat.totalChanges += Math.abs(changeAmount);

  stats.totalReputationChanges = (stats.totalReputationChanges ?? 0) + Math.abs(changeAmount);

  updateStats(storyPackageId, stats);
  return factionStat;
}

export function getFactionStats(
  storyPackageId: string,
  factionId: string
): FactionStats | null {
  const stats = getStats(storyPackageId);
  return stats.factionStats?.[factionId] ?? null;
}

export function getAllFactionStats(storyPackageId: string): Record<string, FactionStats> {
  const stats = getStats(storyPackageId);
  return stats.factionStats ?? {};
}
