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
  description: string;
  startNodeId: string;
  nodes: Record<string, StoryNode>;
  endings: Ending[];
}

export interface HistoryEntry {
  nodeId: string;
  choiceId?: string;
  timestamp: number;
}

export interface SaveData {
  currentNodeId: string;
  chapter: number;
  flags: string[];
  unlockedEndings: string[];
  playHistory: HistoryEntry[];
  savedAt: number;
}

export interface GameStats {
  totalPlays: number;
  endingsUnlocked: string[];
  totalEndings: number;
}
