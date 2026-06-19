export interface FactionReputationChange {
  factionId: string;
  change: number;
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
