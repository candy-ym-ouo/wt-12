import type {
  CipherType,
  EncodedLog,
  EvidenceClue,
  HiddenNodeTrigger,
  KeywordCondition,
  StoryPackage,
} from '../data/types';

export function decodeCipher(
  encoded: string,
  cipher: CipherType,
  key?: string
): string {
  switch (cipher) {
    case 'reverse':
      return encoded.split('').reverse().join('');
    case 'rot13':
      return encoded.replace(/[a-zA-Z]/g, (ch) => {
        const base = ch <= 'Z' ? 65 : 97;
        return String.fromCharCode(((ch.charCodeAt(0) - base + 13) % 26) + base);
      });
    case 'caesar': {
      const shift = parseInt(key ?? '3', 10);
      return encoded.replace(/[a-zA-Z]/g, (ch) => {
        const base = ch <= 'Z' ? 65 : 97;
        return String.fromCharCode(
          ((ch.charCodeAt(0) - base - shift + 26 * 10) % 26) + base
        );
      });
    }
    case 'hex':
      try {
        const parts = encoded.includes(' ')
          ? encoded.split(' ')
          : encoded.match(/.{1,2}/g) ?? [];
        return parts
          .map((h) => String.fromCharCode(parseInt(h, 16)))
          .join('');
      } catch {
        return '[解码失败]';
      }
    case 'base64':
      try {
        return atob(encoded);
      } catch {
        return '[解码失败]';
      }
    case 'xor': {
      const xorKey = key ?? '1';
      return encoded
        .split('')
        .map((ch, i) => {
          const xored =
            ch.charCodeAt(0) ^ xorKey.charCodeAt(i % xorKey.length);
          return String.fromCharCode(xored);
        })
        .join('');
    }
    case 'morse': {
      const morseMap: Record<string, string> = {
        '.-': 'A',
        '-...': 'B',
        '-.-.': 'C',
        '-..': 'D',
        '.': 'E',
        '..-.': 'F',
        '--.': 'G',
        '....': 'H',
        '..': 'I',
        '.---': 'J',
        '-.-': 'K',
        '.-..': 'L',
        '--': 'M',
        '-.': 'N',
        '---': 'O',
        '.--.': 'P',
        '--.-': 'Q',
        '.-.': 'R',
        '...': 'S',
        '-': 'T',
        '..-': 'U',
        '...-': 'V',
        '.--': 'W',
        '-..-': 'X',
        '-.--': 'Y',
        '--..': 'Z',
        '-----': '0',
        '.----': '1',
        '..---': '2',
        '...--': '3',
        '....-': '4',
        '.....': '5',
        '-....': '6',
        '--...': '7',
        '---..': '8',
        '----.': '9',
        '/': ' ',
      };
      return encoded
        .split(' / ')
        .map((word) =>
          word
            .split(' ')
            .map((letter) => morseMap[letter] ?? '?')
            .join('')
        )
        .join(' ');
    }
    default:
      return encoded;
  }
}

export interface PuzzleProgress {
  totalClues: number;
  collectedClues: number;
  totalLogs: number;
  decodedLogs: number;
  totalKeywords: number;
  verifiedKeywords: number;
  totalTriggers: number;
  triggeredTriggers: number;
  overallPercent: number;
}

export function calculatePuzzleProgress(
  storyPackage: StoryPackage | null,
  collectedClueIds: Set<string>,
  decodedLogIds: Set<string>,
  verifiedKeywordSet: Set<string>,
  triggeredTriggerIds: Set<string>
): PuzzleProgress {
  const clues = storyPackage?.evidenceClues ?? [];
  const logs = storyPackage?.encodedLogs ?? [];
  const keywords = storyPackage?.keywords ?? [];
  const triggers = storyPackage?.hiddenNodeTriggers ?? [];

  const totalClues = clues.length;
  const collectedClues = clues.filter((c) => collectedClueIds.has(c.id)).length;

  const totalLogs = logs.length;
  const decodedLogs = logs.filter((l) => decodedLogIds.has(l.id)).length;

  const totalKeywords = keywords.length;
  const verifiedKeywords = keywords.filter((k) =>
    verifiedKeywordSet.has(k.keyword)
  ).length;

  const totalTriggers = triggers.length;
  const triggeredTriggers = triggers.filter((t) =>
    triggeredTriggerIds.has(t.id)
  ).length;

  const totalItems = totalClues + totalLogs + totalKeywords + totalTriggers;
  const collectedItems =
    collectedClues + decodedLogs + verifiedKeywords + triggeredTriggers;
  const overallPercent =
    totalItems > 0 ? Math.round((collectedItems / totalItems) * 100) : 0;

  return {
    totalClues,
    collectedClues,
    totalLogs,
    decodedLogs,
    totalKeywords,
    verifiedKeywords,
    totalTriggers,
    triggeredTriggers,
    overallPercent,
  };
}

export interface EvidenceRelation {
  sourceType: 'clue' | 'log' | 'keyword' | 'trigger';
  sourceId: string;
  targetType: 'clue' | 'log' | 'keyword' | 'trigger';
  targetId: string;
  relationType: 'reveals' | 'requires' | 'related';
}

export function buildEvidenceRelations(
  storyPackage: StoryPackage | null
): EvidenceRelation[] {
  if (!storyPackage) return [];
  const relations: EvidenceRelation[] = [];

  const clues = storyPackage.evidenceClues ?? [];
  const logs = storyPackage.encodedLogs ?? [];
  const triggers = storyPackage.hiddenNodeTriggers ?? [];

  for (const log of logs) {
    if (log.clueIds) {
      for (const clueId of log.clueIds) {
        relations.push({
          sourceType: 'log',
          sourceId: log.id,
          targetType: 'clue',
          targetId: clueId,
          relationType: 'reveals',
        });
      }
    }
    if (log.keyword) {
      relations.push({
        sourceType: 'log',
        sourceId: log.id,
        targetType: 'keyword',
        targetId: log.keyword,
        relationType: 'reveals',
      });
    }
  }

  for (const clue of clues) {
    if (clue.relatedLogId) {
      relations.push({
        sourceType: 'clue',
        sourceId: clue.id,
        targetType: 'log',
        targetId: clue.relatedLogId,
        relationType: 'related',
      });
    }
    if (clue.relatedKeyword) {
      relations.push({
        sourceType: 'clue',
        sourceId: clue.id,
        targetType: 'keyword',
        targetId: clue.relatedKeyword,
        relationType: 'related',
      });
    }
  }

  for (const trigger of triggers) {
    for (const clueId of trigger.requiredClueIds) {
      relations.push({
        sourceType: 'trigger',
        sourceId: trigger.id,
        targetType: 'clue',
        targetId: clueId,
        relationType: 'requires',
      });
    }
    for (const keywordId of trigger.requiredKeywordIds) {
      relations.push({
        sourceType: 'trigger',
        sourceId: trigger.id,
        targetType: 'keyword',
        targetId: keywordId,
        relationType: 'requires',
      });
    }
    for (const logId of trigger.requiredDecodedLogIds) {
      relations.push({
        sourceType: 'trigger',
        sourceId: trigger.id,
        targetType: 'log',
        targetId: logId,
        relationType: 'requires',
      });
    }
  }

  return relations;
}

export interface TriggerCheckResult {
  trigger: HiddenNodeTrigger;
  isTriggered: boolean;
  missingClues: string[];
  missingKeywords: string[];
  missingLogs: string[];
  progressPercent: number;
}

export function checkTriggerStatus(
  trigger: HiddenNodeTrigger,
  collectedClueIds: Set<string>,
  verifiedKeywordSet: Set<string>,
  decodedLogIds: Set<string>
): TriggerCheckResult {
  const missingClues = trigger.requiredClueIds.filter(
    (id) => !collectedClueIds.has(id)
  );
  const missingKeywords = trigger.requiredKeywordIds.filter(
    (id) => !verifiedKeywordSet.has(id)
  );
  const missingLogs = trigger.requiredDecodedLogIds.filter(
    (id) => !decodedLogIds.has(id)
  );

  const totalRequired =
    trigger.requiredClueIds.length +
    trigger.requiredKeywordIds.length +
    trigger.requiredDecodedLogIds.length;
  const fulfilled =
    trigger.requiredClueIds.length - missingClues.length +
    trigger.requiredKeywordIds.length - missingKeywords.length +
    trigger.requiredDecodedLogIds.length - missingLogs.length;

  const isTriggered =
    missingClues.length === 0 &&
    missingKeywords.length === 0 &&
    missingLogs.length === 0;

  return {
    trigger,
    isTriggered,
    missingClues,
    missingKeywords,
    missingLogs,
    progressPercent:
      totalRequired > 0 ? Math.round((fulfilled / totalRequired) * 100) : 0,
  };
}

export function matchKeyword(
  input: string,
  keywordConditions: KeywordCondition[]
): KeywordCondition | null {
  const trimmed = input.trim();
  for (const kw of keywordConditions) {
    if (kw.caseSensitive) {
      if (kw.keyword === trimmed) return kw;
    } else {
      if (kw.keyword.toLowerCase() === trimmed.toLowerCase()) return kw;
    }
  }
  return null;
}

export function getRelatedEvidence<T extends EvidenceClue | EncodedLog>(
  itemId: string,
  relations: EvidenceRelation[],
  allClues: EvidenceClue[],
  allLogs: EncodedLog[]
): (EvidenceClue | EncodedLog)[] {
  const related: (EvidenceClue | EncodedLog)[] = [];
  const relatedIds = new Set<string>();

  for (const rel of relations) {
    if (rel.sourceId === itemId) {
      relatedIds.add(`${rel.targetType}:${rel.targetId}`);
    }
    if (rel.targetId === itemId) {
      relatedIds.add(`${rel.sourceType}:${rel.sourceId}`);
    }
  }

  for (const id of relatedIds) {
    const [type, realId] = id.split(':');
    if (type === 'clue') {
      const found = allClues.find((c) => c.id === realId);
      if (found) related.push(found);
    } else if (type === 'log') {
      const found = allLogs.find((l) => l.id === realId);
      if (found) related.push(found);
    }
  }

  return related;
}

export const cipherDescriptions: Record<CipherType, { name: string; description: string; icon: string }> = {
  caesar: {
    name: '凯撒密码',
    description: '字母按固定偏移量替换',
    icon: '🔤',
  },
  rot13: {
    name: 'ROT13',
    description: '字母偏移13位',
    icon: '🔃',
  },
  base64: {
    name: 'Base64',
    description: 'Base64编码文本',
    icon: '📟',
  },
  hex: {
    name: '十六进制',
    description: '十六进制字符编码',
    icon: '🔢',
  },
  reverse: {
    name: '倒序',
    description: '字符顺序反转',
    icon: '🔄',
  },
  xor: {
    name: 'XOR加密',
    description: '异或运算加密',
    icon: '⚡',
  },
  morse: {
    name: '摩斯电码',
    description: '点划组成的电码',
    icon: '📡',
  },
};
