import type { SaveData, GameStats } from '../data/types';

const SAVE_KEY = 'glitch_adventure_save';
const STATS_KEY = 'glitch_adventure_stats';

export function saveGame(data: SaveData): void {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save game:', e);
  }
}

export function loadGame(): SaveData | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SaveData;
  } catch (e) {
    console.error('Failed to load game:', e);
    return null;
  }
}

export function hasSave(): boolean {
  return localStorage.getItem(SAVE_KEY) !== null;
}

export function deleteSave(): void {
  localStorage.removeItem(SAVE_KEY);
}

export function getStats(): GameStats {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) {
      return { totalPlays: 0, endingsUnlocked: [], totalEndings: 0 };
    }
    return JSON.parse(raw) as GameStats;
  } catch {
    return { totalPlays: 0, endingsUnlocked: [], totalEndings: 0 };
  }
}

export function updateStats(updates: Partial<GameStats>): GameStats {
  const current = getStats();
  const merged: GameStats = {
    ...current,
    ...updates,
    endingsUnlocked: updates.endingsUnlocked ?? current.endingsUnlocked,
  };
  localStorage.setItem(STATS_KEY, JSON.stringify(merged));
  return merged;
}

export function unlockEnding(endingId: string): string[] {
  const stats = getStats();
  if (!stats.endingsUnlocked.includes(endingId)) {
    stats.endingsUnlocked.push(endingId);
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  }
  return stats.endingsUnlocked;
}

export function incrementPlayCount(): number {
  const stats = getStats();
  stats.totalPlays += 1;
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  return stats.totalPlays;
}

export function setTotalEndings(count: number): void {
  const stats = getStats();
  stats.totalEndings = count;
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}
