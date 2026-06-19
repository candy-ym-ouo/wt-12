import { create } from 'zustand';
import type {
  StoryPackage,
  HistoryEntry,
  SaveData,
  FactionReputation,
  FactionReputationChange,
  ReputationCondition,
  EncodedLog,
  EvidenceClue,
  HiddenNodeTrigger,
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
  collectedClues: Set<string>;
  decodedLogs: Set<string>;
  verifiedKeywords: Set<string>;
  triggeredHiddenNodes: Set<string>;
  pendingHiddenTriggers: string[];

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
  collectClue: (clueId: string) => boolean;
  hasClue: (clueId: string) => boolean;
  collectCluesFromNode: (nodeId: string) => string[];
  decodeLog: (logId: string) => EncodedLog | null;
  isLogDecoded: (logId: string) => boolean;
  getAvailableLogs: () => EncodedLog[];
  verifyKeyword: (keyword: string) => boolean;
  isKeywordVerified: (keyword: string) => boolean;
  checkHiddenNodeTriggers: () => string[];
  dismissPendingTrigger: (triggerId: string) => void;
  getClueById: (clueId: string) => EvidenceClue | null;
  getLogById: (logId: string) => EncodedLog | null;
  getTriggerById: (triggerId: string) => HiddenNodeTrigger | null;
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
  collectedClues: new Set(),
  decodedLogs: new Set(),
  verifiedKeywords: new Set(),
  triggeredHiddenNodes: new Set(),
  pendingHiddenTriggers: [],

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

    if (node.collectClues && node.collectClues.length > 0) {
      get().collectCluesFromNode(nodeId);
    }

    if (node.unlockLogId) {
      get().decodeLog(node.unlockLogId);
    }

    if (node.hiddenTriggers && node.hiddenTriggers.length > 0) {
      get().checkHiddenNodeTriggers();
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
      collectedClues: new Set(),
      decodedLogs: new Set(),
      verifiedKeywords: new Set(),
      triggeredHiddenNodes: new Set(),
      pendingHiddenTriggers: [],
    });
  },

  continueGame: (storyPackageId) => {
    const { storyPackage } = get();
    const id = storyPackageId ?? storyPackage?.id;
    if (!id) return false;
    return get().loadFromStorage(id);
  },

  saveToStorage: () => {
    const { storyPackage, currentNodeId, chapter, flags, unlockedEndings, playHistory, reputation, collectedClues, decodedLogs, verifiedKeywords, triggeredHiddenNodes } = get();
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
      collectedClues: Array.from(collectedClues),
      decodedLogs: Array.from(decodedLogs),
      verifiedKeywords: Array.from(verifiedKeywords),
      triggeredHiddenNodes: Array.from(triggeredHiddenNodes),
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
      collectedClues: new Set(data.collectedClues ?? []),
      decodedLogs: new Set(data.decodedLogs ?? []),
      verifiedKeywords: new Set(data.verifiedKeywords ?? []),
      triggeredHiddenNodes: new Set(data.triggeredHiddenNodes ?? []),
      pendingHiddenTriggers: [],
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
      collectedClues: new Set(),
      decodedLogs: new Set(),
      verifiedKeywords: new Set(),
      triggeredHiddenNodes: new Set(),
      pendingHiddenTriggers: [],
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
      collectedClues: new Set(),
      decodedLogs: new Set(),
      verifiedKeywords: new Set(),
      triggeredHiddenNodes: new Set(),
      pendingHiddenTriggers: [],
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

  collectClue: (clueId) => {
    const { collectedClues } = get();
    if (collectedClues.has(clueId)) return false;
    const newClues = new Set(collectedClues);
    newClues.add(clueId);
    set({ collectedClues: newClues });
    get().checkHiddenNodeTriggers();
    return true;
  },

  hasClue: (clueId) => {
    return get().collectedClues.has(clueId);
  },

  collectCluesFromNode: (nodeId) => {
    const { storyPackage } = get();
    if (!storyPackage) return [];
    const node = storyPackage.nodes[nodeId];
    if (!node?.collectClues) return [];
    const newlyCollected: string[] = [];
    for (const clueId of node.collectClues) {
      if (get().collectClue(clueId)) {
        newlyCollected.push(clueId);
      }
    }
    return newlyCollected;
  },

  decodeLog: (logId) => {
    const { storyPackage, decodedLogs, collectedClues, flags } = get();
    if (!storyPackage?.encodedLogs) return null;
    const log = storyPackage.encodedLogs.find((l) => l.id === logId);
    if (!log) return null;
    if (log.unlockCondition && !flags.has(log.unlockCondition)) return null;
    if (!decodedLogs.has(logId)) {
      const newDecoded = new Set(decodedLogs);
      newDecoded.add(logId);
      set({ decodedLogs: newDecoded });
    }
    if (log.clueIds) {
      for (const clueId of log.clueIds) {
        if (!collectedClues.has(clueId)) {
          get().collectClue(clueId);
        }
      }
    }
    if (log.keyword) {
      get().verifyKeyword(log.keyword);
    }
    get().checkHiddenNodeTriggers();
    return log;
  },

  isLogDecoded: (logId) => {
    return get().decodedLogs.has(logId);
  },

  getAvailableLogs: () => {
    const { storyPackage, flags } = get();
    if (!storyPackage?.encodedLogs) return [];
    return storyPackage.encodedLogs.filter(
      (log) => !log.unlockCondition || flags.has(log.unlockCondition)
    );
  },

  verifyKeyword: (keyword) => {
    const { storyPackage, verifiedKeywords } = get();
    if (!storyPackage?.keywords) return false;
    const matchedKeyword = storyPackage.keywords.find((kw) => {
      if (kw.caseSensitive) return kw.keyword === keyword;
      return kw.keyword.toLowerCase() === keyword.toLowerCase();
    });
    if (!matchedKeyword) return false;
    if (!verifiedKeywords.has(matchedKeyword.keyword)) {
      const newVerified = new Set(verifiedKeywords);
      newVerified.add(matchedKeyword.keyword);
      set({ verifiedKeywords: newVerified });
      get().checkHiddenNodeTriggers();
    }
    return true;
  },

  isKeywordVerified: (keyword) => {
    return get().verifiedKeywords.has(keyword);
  },

  checkHiddenNodeTriggers: () => {
    const { storyPackage, collectedClues, verifiedKeywords, decodedLogs, triggeredHiddenNodes } = get();
    if (!storyPackage?.hiddenNodeTriggers) return [];
    const newlyTriggered: string[] = [];
    for (const trigger of storyPackage.hiddenNodeTriggers) {
      if (triggeredHiddenNodes.has(trigger.id)) continue;
      const hasAllClues = trigger.requiredClueIds.every((id) => collectedClues.has(id));
      const hasAllKeywords = trigger.requiredKeywordIds.every((id) => verifiedKeywords.has(id));
      const hasAllDecodedLogs = trigger.requiredDecodedLogIds.every((id) => decodedLogs.has(id));
      if (hasAllClues && hasAllKeywords && hasAllDecodedLogs) {
        newlyTriggered.push(trigger.id);
      }
    }
    if (newlyTriggered.length > 0) {
      const newTriggered = new Set(triggeredHiddenNodes);
      for (const id of newlyTriggered) {
        newTriggered.add(id);
      }
      const currentPending = get().pendingHiddenTriggers;
      set({
        triggeredHiddenNodes: newTriggered,
        pendingHiddenTriggers: [...currentPending, ...newlyTriggered],
      });
    }
    return newlyTriggered;
  },

  dismissPendingTrigger: (triggerId) => {
    const { pendingHiddenTriggers } = get();
    set({ pendingHiddenTriggers: pendingHiddenTriggers.filter((id) => id !== triggerId) });
  },

  getClueById: (clueId) => {
    return get().storyPackage?.evidenceClues?.find((c) => c.id === clueId) ?? null;
  },

  getLogById: (logId) => {
    return get().storyPackage?.encodedLogs?.find((l) => l.id === logId) ?? null;
  },

  getTriggerById: (triggerId) => {
    return get().storyPackage?.hiddenNodeTriggers?.find((t) => t.id === triggerId) ?? null;
  },
}));
