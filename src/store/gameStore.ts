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
  Contact,
  Message,
  Conversation,
  IncomingCall,
  BranchTask,
  CommunicationTrigger,
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
  unlockedContacts: Set<string>;
  readMessages: Set<string>;
  answeredCalls: Set<string>;
  rejectedCalls: Set<string>;
  acceptedTasks: Set<string>;
  completedTasks: Set<string>;
  failedTasks: Set<string>;
  triggeredCommunications: Set<string>;
  activeCall: IncomingCall | null;
  pendingCalls: IncomingCall[];
  pendingTasks: string[];
  pendingMessages: string[];
  currentConversationId: string | null;

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
  getContacts: () => Contact[];
  getContactById: (contactId: string) => Contact | null;
  unlockContact: (contactId: string) => boolean;
  isContactUnlocked: (contactId: string) => boolean;
  updateContactStatus: (contactId: string, status: Contact['status']) => void;
  getConversations: () => Conversation[];
  getConversationById: (conversationId: string) => Conversation | null;
  getConversationByContactId: (contactId: string) => Conversation | null;
  sendMessage: (conversationId: string, content: string) => Message | null;
  markMessageAsRead: (messageId: string) => void;
  markConversationAsRead: (conversationId: string) => void;
  setCurrentConversation: (conversationId: string | null) => void;
  getUnreadMessageCount: () => number;
  triggerIncomingCall: (callId: string) => IncomingCall | null;
  answerCall: (callId: string) => boolean;
  rejectCall: (callId: string) => boolean;
  endCall: () => void;
  getPendingCalls: () => IncomingCall[];
  getTasks: () => BranchTask[];
  getTaskById: (taskId: string) => BranchTask | null;
  acceptTask: (taskId: string) => boolean;
  completeTask: (taskId: string) => boolean;
  failTask: (taskId: string) => boolean;
  rejectTask: (taskId: string) => void;
  checkTaskRequirements: (task: BranchTask) => boolean;
  checkCommunicationTriggers: () => string[];
  processNodeCommunication: (nodeId: string) => void;
  dismissPendingTask: (taskId: string) => void;
  dismissPendingMessage: (messageId: string) => void;
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
  unlockedContacts: new Set(),
  readMessages: new Set(),
  answeredCalls: new Set(),
  rejectedCalls: new Set(),
  acceptedTasks: new Set(),
  completedTasks: new Set(),
  failedTasks: new Set(),
  triggeredCommunications: new Set(),
  activeCall: null,
  pendingCalls: [],
  pendingTasks: [],
  pendingMessages: [],
  currentConversationId: null,

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

    const initialUnlockedContacts = new Set<string>();
    if (pkg.communication?.contacts) {
      for (const contact of pkg.communication.contacts) {
        if (contact.isUnlocked && !contact.unlockCondition) {
          initialUnlockedContacts.add(contact.id);
        }
      }
    }

    set({
      storyPackage: pkg,
      totalEndings: pkg.endings.length,
      unlockedEndings: stats.endingsUnlocked,
      totalPlays: stats.totalPlays,
      isLoaded: true,
      reputation: initialReputation,
      unlockedContacts: initialUnlockedContacts,
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

    get().processNodeCommunication(nodeId);
    get().checkCommunicationTriggers();
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

    const initialUnlockedContacts = new Set<string>();
    if (storyPackage.communication?.contacts) {
      for (const contact of storyPackage.communication.contacts) {
        if (contact.isUnlocked && !contact.unlockCondition) {
          initialUnlockedContacts.add(contact.id);
        }
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
      unlockedContacts: initialUnlockedContacts,
      readMessages: new Set(),
      answeredCalls: new Set(),
      rejectedCalls: new Set(),
      acceptedTasks: new Set(),
      completedTasks: new Set(),
      failedTasks: new Set(),
      triggeredCommunications: new Set(),
      activeCall: null,
      pendingCalls: [],
      pendingTasks: [],
      pendingMessages: [],
      currentConversationId: null,
    });
  },

  continueGame: (storyPackageId) => {
    const { storyPackage } = get();
    const id = storyPackageId ?? storyPackage?.id;
    if (!id) return false;
    return get().loadFromStorage(id);
  },

  saveToStorage: () => {
    const {
      storyPackage,
      currentNodeId,
      chapter,
      flags,
      unlockedEndings,
      playHistory,
      reputation,
      collectedClues,
      decodedLogs,
      verifiedKeywords,
      triggeredHiddenNodes,
      unlockedContacts,
      readMessages,
      answeredCalls,
      rejectedCalls,
      acceptedTasks,
      completedTasks,
      failedTasks,
      triggeredCommunications,
    } = get();
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
      unlockedContacts: Array.from(unlockedContacts),
      readMessages: Array.from(readMessages),
      answeredCalls: Array.from(answeredCalls),
      rejectedCalls: Array.from(rejectedCalls),
      acceptedTasks: Array.from(acceptedTasks),
      completedTasks: Array.from(completedTasks),
      failedTasks: Array.from(failedTasks),
      triggeredCommunications: Array.from(triggeredCommunications),
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

    const initialUnlockedContacts = new Set(data.unlockedContacts ?? []);
    if (storyPackage?.communication?.contacts && initialUnlockedContacts.size === 0) {
      for (const contact of storyPackage.communication.contacts) {
        if (contact.isUnlocked && !contact.unlockCondition) {
          initialUnlockedContacts.add(contact.id);
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
      unlockedContacts: initialUnlockedContacts,
      readMessages: new Set(data.readMessages ?? []),
      answeredCalls: new Set(data.answeredCalls ?? []),
      rejectedCalls: new Set(data.rejectedCalls ?? []),
      acceptedTasks: new Set(data.acceptedTasks ?? []),
      completedTasks: new Set(data.completedTasks ?? []),
      failedTasks: new Set(data.failedTasks ?? []),
      triggeredCommunications: new Set(data.triggeredCommunications ?? []),
      activeCall: null,
      pendingCalls: [],
      pendingTasks: [],
      pendingMessages: [],
      currentConversationId: null,
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
    const initialUnlockedContacts = new Set<string>();
    if (storyPackage?.communication?.contacts) {
      for (const contact of storyPackage.communication.contacts) {
        if (contact.isUnlocked && !contact.unlockCondition) {
          initialUnlockedContacts.add(contact.id);
        }
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
      unlockedContacts: initialUnlockedContacts,
      readMessages: new Set(),
      answeredCalls: new Set(),
      rejectedCalls: new Set(),
      acceptedTasks: new Set(),
      completedTasks: new Set(),
      failedTasks: new Set(),
      triggeredCommunications: new Set(),
      activeCall: null,
      pendingCalls: [],
      pendingTasks: [],
      pendingMessages: [],
      currentConversationId: null,
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
      unlockedContacts: new Set(),
      readMessages: new Set(),
      answeredCalls: new Set(),
      rejectedCalls: new Set(),
      acceptedTasks: new Set(),
      completedTasks: new Set(),
      failedTasks: new Set(),
      triggeredCommunications: new Set(),
      activeCall: null,
      pendingCalls: [],
      pendingTasks: [],
      pendingMessages: [],
      currentConversationId: null,
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

  getContacts: () => {
    const { storyPackage, unlockedContacts } = get();
    if (!storyPackage?.communication?.contacts) return [];
    return storyPackage.communication.contacts
      .filter((c) => unlockedContacts.has(c.id) || (c.isUnlocked && !c.unlockCondition))
      .sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0));
  },

  getContactById: (contactId) => {
    const { storyPackage, unlockedContacts } = get();
    const contact = storyPackage?.communication?.contacts?.find((c) => c.id === contactId);
    if (!contact) return null;
    if (!unlockedContacts.has(contactId) && !(contact.isUnlocked && !contact.unlockCondition)) return null;
    return contact;
  },

  unlockContact: (contactId) => {
    const { unlockedContacts, storyPackage } = get();
    if (unlockedContacts.has(contactId)) return false;
    const contact = storyPackage?.communication?.contacts?.find((c) => c.id === contactId);
    if (!contact) return false;
    if (contact.unlockCondition && !get().hasFlag(contact.unlockCondition)) return false;
    const newUnlocked = new Set(unlockedContacts);
    newUnlocked.add(contactId);
    set({ unlockedContacts: newUnlocked });
    return true;
  },

  isContactUnlocked: (contactId) => {
    const { unlockedContacts, storyPackage } = get();
    if (unlockedContacts.has(contactId)) return true;
    const contact = storyPackage?.communication?.contacts?.find((c) => c.id === contactId);
    return !!(contact?.isUnlocked && !contact.unlockCondition);
  },

  updateContactStatus: (contactId, status) => {
    const { storyPackage } = get();
    if (!storyPackage?.communication?.contacts) return;
    const contacts = storyPackage.communication.contacts.map((c) =>
      c.id === contactId ? { ...c, status, lastSeen: Date.now() } : c
    );
    set({
      storyPackage: {
        ...storyPackage,
        communication: {
          ...storyPackage.communication,
          contacts,
        },
      },
    });
  },

  getConversations: () => {
    const { storyPackage, unlockedContacts } = get();
    if (!storyPackage?.communication?.conversations) return [];
    return storyPackage.communication.conversations
      .filter((c) => unlockedContacts.has(c.contactId))
      .sort((a, b) => b.lastMessageAt - a.lastMessageAt);
  },

  getConversationById: (conversationId) => {
    return get().storyPackage?.communication?.conversations?.find((c) => c.id === conversationId) ?? null;
  },

  getConversationByContactId: (contactId) => {
    return get().storyPackage?.communication?.conversations?.find((c) => c.contactId === contactId) ?? null;
  },

  sendMessage: (conversationId, content) => {
    const { storyPackage, currentConversationId } = get();
    if (!storyPackage?.communication?.conversations) return null;
    const conversation = storyPackage.communication.conversations.find((c) => c.id === conversationId);
    if (!conversation) return null;

    const newMessage: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      conversationId,
      senderId: 'player',
      receiverId: conversation.contactId,
      content,
      type: 'text',
      timestamp: Date.now(),
      isRead: true,
    };

    const updatedConversations = storyPackage.communication.conversations.map((c) => {
      if (c.id === conversationId) {
        return {
          ...c,
          messages: [...c.messages, newMessage],
          lastMessageAt: Date.now(),
        };
      }
      return c;
    });

    set({
      storyPackage: {
        ...storyPackage,
        communication: {
          ...storyPackage.communication,
          conversations: updatedConversations,
        },
      },
      currentConversationId: currentConversationId ?? conversationId,
    });

    return newMessage;
  },

  markMessageAsRead: (messageId) => {
    const { readMessages, storyPackage } = get();
    if (readMessages.has(messageId)) return;
    const newRead = new Set(readMessages);
    newRead.add(messageId);
    set({ readMessages: newRead });

    if (!storyPackage?.communication?.conversations) return;
    const updatedConversations = storyPackage.communication.conversations.map((c) => ({
      ...c,
      messages: c.messages.map((m) => (m.id === messageId ? { ...m, isRead: true } : m)),
      unreadCount: c.messages.filter((m) => !m.isRead && m.id !== messageId).length,
    }));
    set({
      storyPackage: {
        ...storyPackage,
        communication: {
          ...storyPackage.communication,
          conversations: updatedConversations,
        },
      },
    });
  },

  markConversationAsRead: (conversationId) => {
    const { storyPackage, readMessages } = get();
    if (!storyPackage?.communication?.conversations) return;
    const conversation = storyPackage.communication.conversations.find((c) => c.id === conversationId);
    if (!conversation) return;

    const newRead = new Set(readMessages);
    conversation.messages.forEach((m) => newRead.add(m.id));
    set({ readMessages: newRead });

    const updatedConversations = storyPackage.communication.conversations.map((c) =>
      c.id === conversationId ? { ...c, unreadCount: 0, messages: c.messages.map((m) => ({ ...m, isRead: true })) } : c
    );
    set({
      storyPackage: {
        ...storyPackage,
        communication: {
          ...storyPackage.communication,
          conversations: updatedConversations,
        },
      },
    });
  },

  setCurrentConversation: (conversationId) => {
    set({ currentConversationId: conversationId });
    if (conversationId) {
      get().markConversationAsRead(conversationId);
    }
  },

  getUnreadMessageCount: () => {
    const { storyPackage } = get();
    if (!storyPackage?.communication?.conversations) return 0;
    return storyPackage.communication.conversations.reduce((acc, c) => acc + c.unreadCount, 0);
  },

  triggerIncomingCall: (callId) => {
    const { storyPackage, pendingCalls, activeCall } = get();
    if (activeCall) return null;
    const call = storyPackage?.communication?.incomingCalls?.find((c) => c.id === callId);
    if (!call) return null;
    const newCall: IncomingCall = { ...call, status: 'ringing', startTime: Date.now() };
    set({
      pendingCalls: [...pendingCalls, newCall],
      activeCall: newCall,
    });
    return newCall;
  },

  answerCall: (callId) => {
    const { activeCall, pendingCalls } = get();
    if (!activeCall || activeCall.id !== callId) return false;
    if (activeCall.reputationChangesOnAnswer) {
      get().changeReputation(activeCall.reputationChangesOnAnswer);
    }
    if (activeCall.setFlagOnAnswer) {
      get().setFlag(activeCall.setFlagOnAnswer);
    }
    const newAnswered = new Set(get().answeredCalls);
    newAnswered.add(callId);
    set({
      answeredCalls: newAnswered,
      activeCall: { ...activeCall, status: 'connected' },
      pendingCalls: pendingCalls.filter((c) => c.id !== callId),
    });
    if (activeCall.nextNodeIdOnAnswer) {
      get().goToNode(activeCall.nextNodeIdOnAnswer);
    }
    return true;
  },

  rejectCall: (callId) => {
    const { activeCall, pendingCalls } = get();
    if (!activeCall || activeCall.id !== callId) return false;
    if (activeCall.reputationChangesOnReject) {
      get().changeReputation(activeCall.reputationChangesOnReject);
    }
    if (activeCall.setFlagOnReject) {
      get().setFlag(activeCall.setFlagOnReject);
    }
    const newRejected = new Set(get().rejectedCalls);
    newRejected.add(callId);
    set({
      rejectedCalls: newRejected,
      activeCall: null,
      pendingCalls: pendingCalls.filter((c) => c.id !== callId),
    });
    if (activeCall.nextNodeIdOnReject) {
      get().goToNode(activeCall.nextNodeIdOnReject);
    }
    return true;
  },

  endCall: () => {
    const { activeCall } = get();
    if (!activeCall) return;
    set({
      activeCall: null,
    });
  },

  getPendingCalls: () => {
    return get().pendingCalls;
  },

  getTasks: () => {
    const { storyPackage, acceptedTasks, completedTasks, failedTasks, triggeredCommunications } = get();
    if (!storyPackage?.communication?.branchTasks) return [];
    return storyPackage.communication.branchTasks.filter((task) => {
      if (task.isHidden && !triggeredCommunications.has(task.id)) return false;
      if (task.unlockCondition && !get().hasFlag(task.unlockCondition)) return false;
      return acceptedTasks.has(task.id) || completedTasks.has(task.id) || failedTasks.has(task.id) || task.status === 'pending';
    });
  },

  getTaskById: (taskId) => {
    return get().storyPackage?.communication?.branchTasks?.find((t) => t.id === taskId) ?? null;
  },

  checkTaskRequirements: (task) => {
    const { collectedClues, verifiedKeywords } = get();
    if (task.requiredClueIds) {
      for (const clueId of task.requiredClueIds) {
        if (!collectedClues.has(clueId)) return false;
      }
    }
    if (task.requiredKeywordIds) {
      for (const kwId of task.requiredKeywordIds) {
        if (!verifiedKeywords.has(kwId)) return false;
      }
    }
    if (task.requiredReputation) {
      if (!get().checkReputationConditions(task.requiredReputation)) return false;
    }
    if (task.requiredFlags) {
      for (const flag of task.requiredFlags) {
        if (!get().hasFlag(flag)) return false;
      }
    }
    return true;
  },

  acceptTask: (taskId) => {
    const { acceptedTasks, storyPackage, pendingTasks } = get();
    if (acceptedTasks.has(taskId)) return false;
    const task = storyPackage?.communication?.branchTasks?.find((t) => t.id === taskId);
    if (!task) return false;
    if (!get().checkTaskRequirements(task)) return false;
    const newAccepted = new Set(acceptedTasks);
    newAccepted.add(taskId);
    set({
      acceptedTasks: newAccepted,
      pendingTasks: pendingTasks.filter((id) => id !== taskId),
    });
    if (task.nextNodeIdOnAccept) {
      get().goToNode(task.nextNodeIdOnAccept);
    }
    return true;
  },

  completeTask: (taskId) => {
    const { completedTasks, acceptedTasks, storyPackage } = get();
    if (completedTasks.has(taskId)) return false;
    const task = storyPackage?.communication?.branchTasks?.find((t) => t.id === taskId);
    if (!task) return false;
    const newCompleted = new Set(completedTasks);
    newCompleted.add(taskId);
    const newAccepted = new Set(acceptedTasks);
    newAccepted.delete(taskId);
    set({
      completedTasks: newCompleted,
      acceptedTasks: newAccepted,
    });
    if (task.rewardClueIds) {
      for (const clueId of task.rewardClueIds) {
        get().collectClue(clueId);
      }
    }
    if (task.rewardFlags) {
      for (const flag of task.rewardFlags) {
        get().setFlag(flag);
      }
    }
    if (task.rewardReputation) {
      get().changeReputation(task.rewardReputation);
    }
    if (task.nextNodeIdOnComplete) {
      get().goToNode(task.nextNodeIdOnComplete);
    }
    return true;
  },

  failTask: (taskId) => {
    const { failedTasks, acceptedTasks, storyPackage } = get();
    if (failedTasks.has(taskId)) return false;
    const task = storyPackage?.communication?.branchTasks?.find((t) => t.id === taskId);
    if (!task) return false;
    const newFailed = new Set(failedTasks);
    newFailed.add(taskId);
    const newAccepted = new Set(acceptedTasks);
    newAccepted.delete(taskId);
    set({
      failedTasks: newFailed,
      acceptedTasks: newAccepted,
    });
    if (task.failureNodeId) {
      get().goToNode(task.failureNodeId);
    }
    return true;
  },

  rejectTask: (taskId) => {
    const { pendingTasks, storyPackage } = get();
    set({
      pendingTasks: pendingTasks.filter((id) => id !== taskId),
    });
    const task = storyPackage?.communication?.branchTasks?.find((t) => t.id === taskId);
    if (task?.nextNodeIdOnReject) {
      get().goToNode(task.nextNodeIdOnReject);
    }
  },

  checkCommunicationTriggers: () => {
    const { storyPackage, triggeredCommunications, currentNodeId, flags, collectedClues, verifiedKeywords, pendingMessages, pendingTasks } = get();
    if (!storyPackage?.communication?.triggers) return [];
    const newlyTriggered: string[] = [];
    for (const trigger of storyPackage.communication.triggers) {
      if (trigger.isOneTime && triggeredCommunications.has(trigger.id)) continue;
      if (trigger.triggerNodeId && trigger.triggerNodeId !== currentNodeId) continue;
      if (trigger.triggerFlag && !flags.has(trigger.triggerFlag)) continue;
      if (trigger.requiredClueIds) {
        const hasAll = trigger.requiredClueIds.every((id) => collectedClues.has(id));
        if (!hasAll) continue;
      }
      if (trigger.requiredKeywordIds) {
        const hasAll = trigger.requiredKeywordIds.every((id) => verifiedKeywords.has(id));
        if (!hasAll) continue;
      }
      if (trigger.requiredReputation) {
        if (!get().checkReputationConditions(trigger.requiredReputation)) continue;
      }
      newlyTriggered.push(trigger.id);
      const executeTrigger = () => {
        switch (trigger.type) {
          case 'message':
            set({ pendingMessages: [...get().pendingMessages, trigger.targetId] });
            break;
          case 'call':
            get().triggerIncomingCall(trigger.targetId);
            break;
          case 'task':
            set({ pendingTasks: [...get().pendingTasks, trigger.targetId] });
            break;
          case 'contact_unlock':
            get().unlockContact(trigger.targetId);
            break;
        }
      };
      if (trigger.delay && trigger.delay > 0) {
        setTimeout(executeTrigger, trigger.delay);
      } else {
        executeTrigger();
      }
    }
    if (newlyTriggered.length > 0) {
      const newTriggered = new Set(triggeredCommunications);
      for (const id of newlyTriggered) {
        newTriggered.add(id);
      }
      set({ triggeredCommunications: newTriggered });
    }
    return newlyTriggered;
  },

  processNodeCommunication: (nodeId) => {
    const { storyPackage, pendingMessages, pendingTasks } = get();
    const node = storyPackage?.nodes[nodeId];
    if (!node) return;
    if (node.sendMessages && node.sendMessages.length > 0) {
      set({ pendingMessages: [...pendingMessages, ...node.sendMessages] });
    }
    if (node.triggerCall) {
      get().triggerIncomingCall(node.triggerCall);
    }
    if (node.triggerTask) {
      set({ pendingTasks: [...pendingTasks, node.triggerTask] });
    }
    if (node.unlockContact) {
      get().unlockContact(node.unlockContact);
    }
  },

  dismissPendingTask: (taskId) => {
    const { pendingTasks } = get();
    set({ pendingTasks: pendingTasks.filter((id) => id !== taskId) });
  },

  dismissPendingMessage: (messageId) => {
    const { pendingMessages } = get();
    set({ pendingMessages: pendingMessages.filter((id) => id !== messageId) });
  },
}));
