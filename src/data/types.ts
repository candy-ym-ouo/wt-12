export interface Choice {
  id: string;
  text: string;
  nextId: string;
  condition?: string;
  setFlag?: string;
}

export interface Ending {
  id: string;
  title: string;
  description: string;
  isHidden?: boolean;
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
}

export interface HistoryEntry {
  nodeId: string;
  choiceId?: string;
  timestamp: number;
}

export interface SaveData {
  storyPackageId: string;
  currentNodeId: string;
  chapter: number;
  flags: string[];
  unlockedEndings: string[];
  playHistory: HistoryEntry[];
  savedAt: number;
}

export interface GameStats {
  storyPackageId: string;
  totalPlays: number;
  endingsUnlocked: string[];
  totalEndings: number;
  completedChapters: number[];
  totalPlayTime: number;
}

export interface AllStats {
  [storyPackageId: string]: GameStats;
}
