export interface FactionReputationChange {
  factionId: string;
  change: number;
}

export type CipherType = 'caesar' | 'rot13' | 'base64' | 'hex' | 'reverse' | 'xor' | 'morse';

export interface EvidenceClue {
  id: string;
  title: string;
  description: string;
  category?: string;
  icon?: string;
  relatedLogId?: string;
  relatedKeyword?: string;
  isHidden?: boolean;
}

export interface EncodedLog {
  id: string;
  title: string;
  encodedContent: string;
  cipher: CipherType;
  cipherKey?: string;
  decodedContent: string;
  clueIds?: string[];
  keyword?: string;
  isAvailable?: boolean;
  unlockCondition?: string;
}

export interface KeywordCondition {
  keyword: string;
  caseSensitive?: boolean;
  description?: string;
}

export interface HiddenNodeTrigger {
  id: string;
  name: string;
  description?: string;
  requiredClueIds: string[];
  requiredKeywordIds: string[];
  requiredDecodedLogIds: string[];
  targetNodeId: string;
  isTriggered?: boolean;
}

export interface ReputationCondition {
  factionId: string;
  minReputation?: number;
  maxReputation?: number;
}

export interface Choice {
  id: string;
  text: string;
  nextId: string;
  condition?: string;
  setFlag?: string;
  reputationChanges?: FactionReputationChange[];
  reputationConditions?: ReputationCondition[];
}

export interface Faction {
  id: string;
  name: string;
  shortName?: string;
  description?: string;
  color?: string;
  icon?: string;
  initialReputation: number;
  minReputation?: number;
  maxReputation?: number;
  relationships?: FactionRelationship[];
}

export interface FactionRelationship {
  targetFactionId: string;
  type: 'ally' | 'enemy' | 'neutral' | 'rival';
  reputationTransferRatio?: number;
}

export interface EndingWeight {
  endingId: string;
  baseWeight: number;
  factionWeights?: {
    factionId: string;
    perPoint: number;
    minReputation?: number;
    maxReputation?: number;
  }[];
  flagWeights?: {
    flag: string;
    weight: number;
  }[];
}

export interface Ending {
  id: string;
  title: string;
  description: string;
  isHidden?: boolean;
  relatedFactions?: string[];
}

export interface ChapterMetadata {
  id: number;
  title: string;
  subtitle?: string;
  description?: string;
  estimatedDuration?: string;
  themes?: string[];
  isUnlocked?: boolean;
  totalNodes?: number;
}

export interface StoryNode {
  id: string;
  text: string;
  glitchLevel?: number;
  type: 'narrative' | 'choice' | 'input' | 'ending';
  choices?: Choice[];
  inputKeyword?: string;
  inputHint?: string;
  inputFailureNextId?: string;
  nextId?: string;
  ending?: Ending;
  chapter?: number;
  setFlag?: string;
  audioCue?: 'typing' | 'glitch' | 'ambient' | 'ending' | 'none';
  reputationChanges?: FactionReputationChange[];
  collectClues?: string[];
  unlockLogId?: string;
  hiddenTriggers?: string[];
}

export interface StoryPackage {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  coverImage?: string;
  author?: string;
  createdAt?: string;
  difficulty?: 'easy' | 'normal' | 'hard';
  genre?: string[];
  estimatedPlaytime?: string;
  startNodeId: string;
  nodes: Record<string, StoryNode>;
  endings: Ending[];
  chapters: ChapterMetadata[];
  factions?: Faction[];
  endingWeights?: EndingWeight[];
  evidenceClues?: EvidenceClue[];
  encodedLogs?: EncodedLog[];
  keywords?: KeywordCondition[];
  hiddenNodeTriggers?: HiddenNodeTrigger[];
}

export interface StoryPackageSummary {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  coverImage?: string;
  author?: string;
  difficulty?: 'easy' | 'normal' | 'hard';
  genre?: string[];
  estimatedPlaytime?: string;
  totalEndings: number;
  totalChapters: number;
  totalFactions?: number;
}

export interface HistoryEntry {
  nodeId: string;
  choiceId?: string;
  timestamp: number;
  reputationChanges?: FactionReputationChange[];
}

export interface FactionReputation {
  [factionId: string]: number;
}

export interface SaveData {
  storyPackageId: string;
  currentNodeId: string;
  chapter: number;
  flags: string[];
  unlockedEndings: string[];
  playHistory: HistoryEntry[];
  savedAt: number;
  reputation: FactionReputation;
  collectedClues: string[];
  decodedLogs: string[];
  verifiedKeywords: string[];
  triggeredHiddenNodes: string[];
}

export interface FactionStats {
  maxReputation: number;
  minReputation: number;
  totalChanges: number;
}

export interface GameStats {
  storyPackageId: string;
  totalPlays: number;
  endingsUnlocked: string[];
  totalEndings: number;
  completedChapters: number[];
  totalPlayTime: number;
  factionStats?: {
    [factionId: string]: FactionStats;
  };
  totalReputationChanges?: number;
}

export interface AllStats {
  [storyPackageId: string]: GameStats;
}
