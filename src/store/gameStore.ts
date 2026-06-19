import { create } from 'zustand';
import type { StoryPackage, HistoryEntry, SaveData } from '../data/types';
import {
  saveGame,
  loadGame,
  deleteSave,
  getStats,
  unlockEnding,
  incrementPlayCount,
  setTotalEndings,
  completeChapter,
} from '../utils/storage';

interface GameStore {
  storyPackage: StoryPackage | null;
  currentNodeId: string;
  chapter: number;
  flags: Set<string>;
  unlockedEndings: string[];
  playHistory: HistoryEntry[];
  totalPlays: number;
  totalEndings: number;
  isLoaded: boolean;
  lastChapter: number;

  setStoryPackage: (pkg: StoryPackage) => void;
  goToNode: (nodeId: string, choiceId?: string) => void;
  setFlag: (flag: string) => void;
  hasFlag: (flag: string) => boolean;
  startNewGame: () => void;
  continueGame: (storyPackageId?: string) => boolean;
  saveToStorage: () => void;
  loadFromStorage: (storyPackageId: string) => boolean;
  deleteSavedGame: (storyPackageId: string) => void;
  recordEnding: (endingId: string) => void;
  resetGame: () => void;
  clearStoryPackage: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  storyPackage: null,
  currentNodeId: '',
  chapter: 1,
  lastChapter: 1,
  flags: new Set(),
  unlockedEndings: [],
  playHistory: [],
  totalPlays: 0,
  totalEndings: 0,
  isLoaded: false,

  setStoryPackage: (pkg) => {
    const stats = getStats(pkg.id);
    setTotalEndings(pkg.id, pkg.endings.length);
    set({
      storyPackage: pkg,
      totalEndings: pkg.endings.length,
      unlockedEndings: stats.endingsUnlocked,
      totalPlays: stats.totalPlays,
      isLoaded: true,
    });
  },

  goToNode: (nodeId, choiceId) => {
    const { storyPackage, playHistory, chapter: currentChapter, lastChapter } = get();
    if (!storyPackage) return;

    const node = storyPackage.nodes[nodeId];
    if (!node) return;

    const newChapter = node.chapter ?? currentChapter;

    if (newChapter > lastChapter) {
      completeChapter(storyPackage.id, lastChapter);
    }

    const newHistory = [...playHistory, { nodeId, choiceId, timestamp: Date.now() }];

    set({
      currentNodeId: nodeId,
      chapter: newChapter,
      lastChapter: Math.max(lastChapter, newChapter),
      playHistory: newHistory,
    });

    if (node.setFlag) {
      get().setFlag(node.setFlag);
    }
  },

  setFlag: (flag) => {
    set((state) => {
      const newFlags = new Set(state.flags);
      newFlags.add(flag);
      return { flags: newFlags };
    });
  },

  hasFlag: (flag) => {
    return get().flags.has(flag);
  },

  startNewGame: () => {
    const { storyPackage } = get();
    if (!storyPackage) return;
    incrementPlayCount(storyPackage.id);
    const stats = getStats(storyPackage.id);
    set({
      currentNodeId: storyPackage.startNodeId,
      chapter: 1,
      lastChapter: 1,
      flags: new Set(),
      playHistory: [],
      totalPlays: stats.totalPlays,
      unlockedEndings: stats.endingsUnlocked,
    });
  },

  continueGame: (storyPackageId) => {
    const { storyPackage } = get();
    const id = storyPackageId ?? storyPackage?.id;
    if (!id) return false;
    return get().loadFromStorage(id);
  },

  saveToStorage: () => {
    const { storyPackage, currentNodeId, chapter, flags, unlockedEndings, playHistory } = get();
    if (!storyPackage) return;
    const data: SaveData = {
      storyPackageId: storyPackage.id,
      currentNodeId,
      chapter,
      flags: Array.from(flags),
      unlockedEndings,
      playHistory,
      savedAt: Date.now(),
    };
    saveGame(data);
  },

  loadFromStorage: (storyPackageId) => {
    const data = loadGame(storyPackageId);
    if (!data) return false;
    set({
      currentNodeId: data.currentNodeId,
      chapter: data.chapter,
      lastChapter: data.chapter,
      flags: new Set(data.flags),
      unlockedEndings: data.unlockedEndings,
      playHistory: data.playHistory,
    });
    return true;
  },

  deleteSavedGame: (storyPackageId) => {
    deleteSave(storyPackageId);
  },

  recordEnding: (endingId) => {
    const { storyPackage } = get();
    if (!storyPackage) return;
    const unlocked = unlockEnding(storyPackage.id, endingId);
    set({ unlockedEndings: unlocked });
  },

  resetGame: () => {
    set({
      currentNodeId: '',
      chapter: 1,
      lastChapter: 1,
      flags: new Set(),
      playHistory: [],
    });
  },

  clearStoryPackage: () => {
    set({
      storyPackage: null,
      currentNodeId: '',
      chapter: 1,
      lastChapter: 1,
      flags: new Set(),
      unlockedEndings: [],
      playHistory: [],
      totalPlays: 0,
      totalEndings: 0,
      isLoaded: false,
    });
  },
}));
