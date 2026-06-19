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

  setStoryPackage: (pkg: StoryPackage) => void;
  goToNode: (nodeId: string, choiceId?: string) => void;
  setFlag: (flag: string) => void;
  hasFlag: (flag: string) => boolean;
  startNewGame: () => void;
  continueGame: () => boolean;
  saveToStorage: () => void;
  loadFromStorage: () => boolean;
  deleteSavedGame: () => void;
  recordEnding: (endingId: string) => void;
  resetGame: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  storyPackage: null,
  currentNodeId: '',
  chapter: 1,
  flags: new Set(),
  unlockedEndings: [],
  playHistory: [],
  totalPlays: 0,
  totalEndings: 0,
  isLoaded: false,

  setStoryPackage: (pkg) => {
    const stats = getStats();
    setTotalEndings(pkg.endings.length);
    set({
      storyPackage: pkg,
      totalEndings: pkg.endings.length,
      unlockedEndings: stats.endingsUnlocked,
      totalPlays: stats.totalPlays,
      isLoaded: true,
    });
  },

  goToNode: (nodeId, choiceId) => {
    const { storyPackage, playHistory } = get();
    if (!storyPackage) return;

    const node = storyPackage.nodes[nodeId];
    if (!node) return;

    const newHistory = [...playHistory, { nodeId, choiceId, timestamp: Date.now() }];

    set({
      currentNodeId: nodeId,
      chapter: node.chapter ?? get().chapter,
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
    incrementPlayCount();
    set({
      currentNodeId: storyPackage.startNodeId,
      chapter: 1,
      flags: new Set(),
      playHistory: [],
      totalPlays: getStats().totalPlays,
    });
  },

  continueGame: () => {
    return get().loadFromStorage();
  },

  saveToStorage: () => {
    const { currentNodeId, chapter, flags, unlockedEndings, playHistory } = get();
    const data: SaveData = {
      currentNodeId,
      chapter,
      flags: Array.from(flags),
      unlockedEndings,
      playHistory,
      savedAt: Date.now(),
    };
    saveGame(data);
  },

  loadFromStorage: () => {
    const data = loadGame();
    if (!data) return false;
    set({
      currentNodeId: data.currentNodeId,
      chapter: data.chapter,
      flags: new Set(data.flags),
      unlockedEndings: data.unlockedEndings,
      playHistory: data.playHistory,
    });
    return true;
  },

  deleteSavedGame: () => {
    deleteSave();
  },

  recordEnding: (endingId) => {
    const unlocked = unlockEnding(endingId);
    set({ unlockedEndings: unlocked });
  },

  resetGame: () => {
    set({
      currentNodeId: '',
      chapter: 1,
      flags: new Set(),
      playHistory: [],
    });
  },
}));
