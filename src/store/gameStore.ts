import { create } from 'zustand';
import type {
  StoryPackage,
  HistoryEntry,
  SaveData,
  FactionReputation,
  FactionReputationChange,
  ReputationCondition,
} from '../data/types';
import {
  saveGame,
  loadGame,
  deleteSave,
  getStats,
  unlockEnding,
  incrementPlayCount,
  setTotalEndings,
  completeChapter,
  initializeFactionStats,
  updateFactionReputationStats,
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
  reputation: FactionReputation;

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
  changeReputation: (changes: FactionReputationChange[]) => FactionReputationChange[];
  getReputation: (factionId: string) => number;
  checkReputationConditions: (conditions: ReputationCondition[]) => boolean;
  calculateEndingWeights: () => Record<string, number>;
  getPredictedEnding: () => string | null;
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
  reputation: {},

  setStoryPackage: (pkg) => {
    const stats = getStats(pkg.id);
    setTotalEndings(pkg.id, pkg.endings.length);

    const initialReputation: FactionReputation = {};
    if (pkg.factions) {
      for (const faction of pkg.factions) {
        initialReputation[faction.id] = faction.initialReputation;
        initializeFactionStats(pkg.id, faction.id, faction.initialReputation);
      }
    }

    set({
      storyPackage: pkg,
      totalEndings: pkg.endings.length,
      unlockedEndings: stats.endingsUnlocked,
      totalPlays: stats.totalPlays,
      isLoaded: true,
      reputation: initialReputation,
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

    let appliedChanges: FactionReputationChange[] = [];
    if (node.reputationChanges && node.reputationChanges.length > 0) {
      appliedChanges = get().changeReputation(node.reputationChanges);
    }

    const newHistory = [...playHistory, { nodeId, choiceId, timestamp: Date.now(), reputationChanges: appliedChanges }];

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

    const initialReputation: FactionReputation = {};
    if (storyPackage.factions) {
      for (const faction of storyPackage.factions) {
        initialReputation[faction.id] = faction.initialReputation;
      }
    }

    set({
      currentNodeId: storyPackage.startNodeId,
      chapter: 1,
      lastChapter: 1,
      flags: new Set(),
      playHistory: [],
      totalPlays: stats.totalPlays,
      unlockedEndings: stats.endingsUnlocked,
      reputation: initialReputation,
    });
  },

  continueGame: (storyPackageId) => {
    const { storyPackage } = get();
    const id = storyPackageId ?? storyPackage?.id;
    if (!id) return false;
    return get().loadFromStorage(id);
  },

  saveToStorage: () => {
    const { storyPackage, currentNodeId, chapter, flags, unlockedEndings, playHistory, reputation } = get();
    if (!storyPackage) return;
    const data: SaveData = {
      storyPackageId: storyPackage.id,
      currentNodeId,
      chapter,
      flags: Array.from(flags),
      unlockedEndings,
      playHistory,
      savedAt: Date.now(),
      reputation,
    };
    saveGame(data);
  },

  loadFromStorage: (storyPackageId) => {
    const data = loadGame(storyPackageId);
    if (!data) return false;

    const { storyPackage } = get();
    const loadedReputation: FactionReputation = data.reputation ?? {};
    if (storyPackage?.factions) {
      for (const faction of storyPackage.factions) {
        if (loadedReputation[faction.id] === undefined) {
          loadedReputation[faction.id] = faction.initialReputation;
        }
      }
    }

    set({
      currentNodeId: data.currentNodeId,
      chapter: data.chapter,
      lastChapter: data.chapter,
      flags: new Set(data.flags),
      unlockedEndings: data.unlockedEndings,
      playHistory: data.playHistory,
      reputation: loadedReputation,
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
    const { storyPackage } = get();
    const initialReputation: FactionReputation = {};
    if (storyPackage?.factions) {
      for (const faction of storyPackage.factions) {
        initialReputation[faction.id] = faction.initialReputation;
      }
    }
    set({
      currentNodeId: '',
      chapter: 1,
      lastChapter: 1,
      flags: new Set(),
      playHistory: [],
      reputation: initialReputation,
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
      reputation: {},
    });
  },

  changeReputation: (changes) => {
    const { storyPackage, reputation } = get();
    if (!storyPackage) return [];

    const newReputation = { ...reputation };
    const appliedChanges: FactionReputationChange[] = [];

    for (const change of changes) {
      const faction = storyPackage.factions?.find((f) => f.id === change.factionId);
      if (!faction) continue;

      const currentVal = newReputation[change.factionId] ?? faction.initialReputation;
      const minVal = faction.minReputation ?? -100;
      const maxVal = faction.maxReputation ?? 100;
      const newVal = Math.max(minVal, Math.min(maxVal, currentVal + change.change));
      const actualChange = newVal - currentVal;

      if (actualChange !== 0) {
        newReputation[change.factionId] = newVal;
        appliedChanges.push({ factionId: change.factionId, change: actualChange });
        updateFactionReputationStats(storyPackage.id, change.factionId, newVal, actualChange);
      }

      if (faction.relationships) {
        for (const rel of faction.relationships) {
          const ratio = rel.reputationTransferRatio ?? 0;
          if (ratio === 0) continue;

          const relatedFaction = storyPackage.factions?.find((f) => f.id === rel.targetFactionId);
          if (!relatedFaction) continue;

          let transferChange = actualChange * ratio;
          if (rel.type === 'enemy') {
            transferChange = -transferChange;
          } else if (rel.type === 'rival') {
            transferChange = -Math.abs(transferChange) * Math.sign(actualChange || 1);
          }

          if (transferChange === 0) continue;

          const relCurrentVal = newReputation[rel.targetFactionId] ?? relatedFaction.initialReputation;
          const relMinVal = relatedFaction.minReputation ?? -100;
          const relMaxVal = relatedFaction.maxReputation ?? 100;
          const relNewVal = Math.max(relMinVal, Math.min(relMaxVal, relCurrentVal + transferChange));
          const relActualChange = relNewVal - relCurrentVal;

          if (relActualChange !== 0) {
            newReputation[rel.targetFactionId] = relNewVal;
            appliedChanges.push({ factionId: rel.targetFactionId, change: relActualChange });
            updateFactionReputationStats(storyPackage.id, rel.targetFactionId, relNewVal, relActualChange);
          }
        }
      }
    }

    if (appliedChanges.length > 0) {
      set({ reputation: newReputation });
    }

    return appliedChanges;
  },

  getReputation: (factionId) => {
    const { reputation, storyPackage } = get();
    if (reputation[factionId] !== undefined) {
      return reputation[factionId];
    }
    const faction = storyPackage?.factions?.find((f) => f.id === factionId);
    return faction?.initialReputation ?? 0;
  },

  checkReputationConditions: (conditions) => {
    for (const cond of conditions) {
      const rep = get().getReputation(cond.factionId);
      if (cond.minReputation !== undefined && rep < cond.minReputation) {
        return false;
      }
      if (cond.maxReputation !== undefined && rep > cond.maxReputation) {
        return false;
      }
    }
    return true;
  },

  calculateEndingWeights: () => {
    const { storyPackage, reputation, flags } = get();
    const weights: Record<string, number> = {};

    if (!storyPackage?.endingWeights) {
      return weights;
    }

    for (const ew of storyPackage.endingWeights) {
      let weight = ew.baseWeight;

      if (ew.factionWeights) {
        for (const fw of ew.factionWeights) {
          const rep = reputation[fw.factionId] ?? 0;
          const effectiveRep = Math.max(
            fw.minReputation ?? -Infinity,
            Math.min(fw.maxReputation ?? Infinity, rep)
          );
          weight += effectiveRep * fw.perPoint;
        }
      }

      if (ew.flagWeights) {
        for (const flagW of ew.flagWeights) {
          if (flags.has(flagW.flag)) {
            weight += flagW.weight;
          }
        }
      }

      weights[ew.endingId] = Math.max(0, weight);
    }

    return weights;
  },

  getPredictedEnding: () => {
    const weights = get().calculateEndingWeights();
    if (Object.keys(weights).length === 0) return null;

    let maxWeight = -Infinity;
    let predictedEnding: string | null = null;

    for (const [endingId, weight] of Object.entries(weights)) {
      if (weight > maxWeight) {
        maxWeight = weight;
        predictedEnding = endingId;
      }
    }

    return predictedEnding;
  },
}));
