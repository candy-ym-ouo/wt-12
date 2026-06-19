import { useState, useCallback, useMemo } from 'react';
import { Search, FileText, Key, Puzzle, Unlock, Lock, CheckCircle, AlertTriangle, LayoutDashboard, Link2, ChevronRight } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { GlitchText } from './GlitchText';
import type { EncodedLog, EvidenceClue, HiddenNodeTrigger, KeywordCondition } from '../data/types';
import {
  decodeCipher,
  calculatePuzzleProgress,
  buildEvidenceRelations,
  checkTriggerStatus,
  matchKeyword,
  cipherDescriptions,
  type PuzzleProgress,
  type EvidenceRelation,
  type TriggerCheckResult,
} from '../utils/evidence';

type TabId = 'overview' | 'clues' | 'logs' | 'keywords' | 'triggers';

function ProgressBar({ value, color = 'green', label }: { value: number; color?: 'green' | 'yellow' | 'magenta' | 'blue'; label?: string }) {
  const colorMap = {
    green: 'bg-glitch-green',
    yellow: 'bg-glitch-yellow',
    magenta: 'bg-glitch-magenta',
    blue: 'bg-glitch-blue',
  };
  return (
    <div className="space-y-1">
      {label && (
        <div className="text-xs font-mono text-glitch-green/60 flex justify-between">
          <span>{label}</span>
          <span>{value}%</span>
        </div>
      )}
      <div className="w-full h-1.5 bg-glitch-green/10">
        <div
          className={`h-full transition-all duration-500 ${colorMap[color]}`}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    </div>
  );
}

function PuzzleOverview({
  progress,
  relations,
  triggerResults,
}: {
  progress: PuzzleProgress;
  relations: EvidenceRelation[];
  triggerResults: TriggerCheckResult[];
}) {
  const statCards = [
    { label: '线索', current: progress.collectedClues, total: progress.totalClues, icon: FileText, color: 'text-glitch-blue' },
    { label: '日志', current: progress.decodedLogs, total: progress.totalLogs, icon: Search, color: 'text-glitch-yellow' },
    { label: '关键词', current: progress.verifiedKeywords, total: progress.totalKeywords, icon: Key, color: 'text-glitch-magenta' },
    { label: '触发', current: progress.triggeredTriggers, total: progress.totalTriggers, icon: Puzzle, color: 'text-glitch-green' },
  ];

  return (
    <div className="space-y-4">
      <div className="border border-glitch-yellow/30 bg-glitch-yellow/5 p-3">
        <div className="flex items-center gap-2 mb-2">
          <LayoutDashboard className="w-4 h-4 text-glitch-yellow" />
          <span className="font-mono text-sm text-glitch-yellow text-shadow-glow-yellow">拼图完成度</span>
        </div>
        <ProgressBar value={progress.overallPercent} color="yellow" />
        <div className="mt-2 text-xs font-mono text-glitch-green/60 text-center">
          已收集 {progress.collectedClues + progress.decodedLogs + progress.verifiedKeywords + progress.triggeredTriggers} / {progress.totalClues + progress.totalLogs + progress.totalKeywords + progress.totalTriggers} 项证据
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          const percent = stat.total > 0 ? Math.round((stat.current / stat.total) * 100) : 0;
          return (
            <div key={stat.label} className="border border-glitch-green/20 bg-glitch-bg/50 p-3">
              <div className="flex items-center gap-2 mb-1">
                <Icon className={`w-3 h-3 ${stat.color}`} />
                <span className="font-mono text-xs text-glitch-green/70">{stat.label}</span>
              </div>
              <div className="font-mono text-lg text-glitch-green text-shadow-glow-green">
                {stat.current} <span className="text-glitch-green/40 text-sm">/ {stat.total}</span>
              </div>
              <ProgressBar value={percent} />
            </div>
          );
        })}
      </div>

      {relations.length > 0 && (
        <div className="border border-glitch-green/20 bg-glitch-bg/50 p-3">
          <div className="flex items-center gap-2 mb-3">
            <Link2 className="w-4 h-4 text-glitch-blue" />
            <span className="font-mono text-sm text-glitch-blue">证据关联网络</span>
            <span className="text-xs text-glitch-green/40 ml-auto">({relations.length} 条关联)</span>
          </div>
          <div className="space-y-1.5 max-h-40 overflow-y-auto">
            {relations.slice(0, 12).map((rel, idx) => {
              const typeColors: Record<string, string> = {
                clue: 'text-glitch-blue',
                log: 'text-glitch-yellow',
                keyword: 'text-glitch-magenta',
                trigger: 'text-glitch-green',
              };
              const typeLabels: Record<string, string> = {
                clue: '线索',
                log: '日志',
                keyword: '关键词',
                trigger: '触发',
              };
              const relationLabels: Record<string, string> = {
                reveals: '揭示',
                requires: '需要',
                related: '关联',
              };
              return (
                <div key={idx} className="flex items-center gap-1 text-xs font-mono text-glitch-green/60">
                  <span className={typeColors[rel.sourceType]}>[{typeLabels[rel.sourceType]}]</span>
                  <span className="truncate max-w-[60px]">{rel.sourceId}</span>
                  <ChevronRight className="w-3 h-3 text-glitch-green/30 flex-shrink-0" />
                  <span className="text-glitch-yellow/70">{relationLabels[rel.relationType]}</span>
                  <ChevronRight className="w-3 h-3 text-glitch-green/30 flex-shrink-0" />
                  <span className={typeColors[rel.targetType]}>[{typeLabels[rel.targetType]}]</span>
                  <span className="truncate max-w-[60px]">{rel.targetId}</span>
                </div>
              );
            })}
            {relations.length > 12 && (
              <div className="text-xs text-glitch-green/30 text-center">...还有 {relations.length - 12} 条关联</div>
            )}
          </div>
        </div>
      )}

      {triggerResults.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Puzzle className="w-4 h-4 text-glitch-green" />
            <span className="font-mono text-sm text-glitch-green">隐藏节点进度</span>
          </div>
          {triggerResults.map((result) => (
            <div
              key={result.trigger.id}
              className={`border p-2 bg-glitch-bg/50 ${
                result.isTriggered ? 'border-glitch-yellow/50' : 'border-glitch-green/20'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`font-mono text-xs ${result.isTriggered ? 'text-glitch-yellow' : 'text-glitch-green/60'}`}>
                  {result.trigger.name}
                </span>
                <span className={`text-xs ${result.isTriggered ? 'text-glitch-yellow animate-blink' : 'text-glitch-green/40'}`}>
                  {result.isTriggered ? '已解锁' : `${result.progressPercent}%`}
                </span>
              </div>
              <ProgressBar value={result.progressPercent} color={result.isTriggered ? 'yellow' : 'green'} />
              {!result.isTriggered && (
                <div className="mt-1 text-[10px] font-mono text-glitch-green/40 flex flex-wrap gap-x-3 gap-y-0.5">
                  {result.missingClues.length > 0 && <span>缺线索×{result.missingClues.length}</span>}
                  {result.missingKeywords.length > 0 && <span>缺关键词×{result.missingKeywords.length}</span>}
                  {result.missingLogs.length > 0 && <span>缺日志×{result.missingLogs.length}</span>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ClueItem({ clue, relations, collectedClues }: { clue: EvidenceClue; relations: EvidenceRelation[]; collectedClues: Set<string> }) {
  const relatedItems = useMemo(() => {
    return relations.filter(
      (r) =>
        (r.sourceId === clue.id && r.sourceType === 'clue') ||
        (r.targetId === clue.id && r.targetType === 'clue')
    );
  }, [clue.id, relations]);

  const isCollected = collectedClues.has(clue.id);

  return (
    <div className={`border p-3 bg-glitch-bg/50 hover:border-glitch-green/60 transition-colors ${
      isCollected ? 'border-glitch-green/40' : 'border-glitch-green/15 opacity-60'
    }`}>
      <div className="flex items-start gap-2">
        <span className="text-lg mt-0.5 flex-shrink-0">{clue.icon ?? '📄'}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div className={`font-mono text-sm ${isCollected ? 'text-glitch-green text-shadow-glow-green' : 'text-glitch-green/50'}`}>
              {isCollected ? clue.title : '???'}
            </div>
            {isCollected && <CheckCircle className="w-3 h-3 text-glitch-green flex-shrink-0" />}
          </div>
          {isCollected ? (
            <div className="text-glitch-green/60 font-mono text-xs mt-1 leading-relaxed">
              {clue.description}
            </div>
          ) : (
            <div className="text-glitch-green/30 font-mono text-xs mt-1 italic">
              尚未发现此线索
            </div>
          )}
          {clue.category && isCollected && (
            <span className="inline-block mt-2 text-xs px-2 py-0.5 border border-glitch-blue/30 text-glitch-blue/70">
              {clue.category}
            </span>
          )}
          {relatedItems.length > 0 && isCollected && (
            <div className="mt-2 flex items-center gap-1 flex-wrap">
              <Link2 className="w-3 h-3 text-glitch-green/40" />
              {relatedItems.map((rel, idx) => {
                const targetId = rel.sourceId === clue.id ? rel.targetId : rel.sourceId;
                const typeLabels: Record<string, string> = {
                  log: '日志',
                  keyword: '关键词',
                  trigger: '触发',
                  clue: '线索',
                };
                const targetType = rel.sourceId === clue.id ? rel.targetType : rel.sourceType;
                return (
                  <span key={idx} className="text-[10px] px-1.5 py-0.5 border border-glitch-green/20 text-glitch-green/50">
                    {typeLabels[targetType]}: {targetId.slice(0, 8)}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EncodedLogCard({
  log,
  isDecoded,
  onDecode,
  relations,
}: {
  log: EncodedLog;
  isDecoded: boolean;
  onDecode: (logId: string) => void;
  relations: EvidenceRelation[];
}) {
  const [showDecoded, setShowDecoded] = useState(isDecoded);
  const cipherInfo = cipherDescriptions[log.cipher];

  const relatedClues = useMemo(() => {
    return relations.filter(
      (r) =>
        (r.sourceId === log.id && r.sourceType === 'log' && r.targetType === 'clue') ||
        (r.targetId === log.id && r.targetType === 'log' && r.sourceType === 'clue')
    );
  }, [log.id, relations]);

  const handleDecode = () => {
    if (isDecoded) {
      setShowDecoded(!showDecoded);
      return;
    }
    onDecode(log.id);
    setShowDecoded(true);
  };

  return (
    <div className={`border p-3 bg-glitch-bg/50 transition-colors ${
      isDecoded ? 'border-glitch-green/40' : 'border-glitch-magenta/40'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {isDecoded ? (
            <Unlock className="w-4 h-4 text-glitch-green" />
          ) : (
            <Lock className="w-4 h-4 text-glitch-magenta" />
          )}
          <span className={`font-mono text-sm ${isDecoded ? 'text-glitch-green text-shadow-glow-green' : 'text-glitch-magenta text-shadow-glow-red'}`}>
            {log.title}
          </span>
        </div>
        <span
          className="text-xs px-2 py-0.5 border text-glitch-yellow/70 border-glitch-yellow/30 uppercase flex items-center gap-1"
          title={cipherInfo?.description}
        >
          <span>{cipherInfo?.icon}</span>
          {log.cipher}
        </span>
      </div>

      <div className="text-[10px] text-glitch-green/40 font-mono mb-2">
        {cipherInfo?.name} - {cipherInfo?.description}
      </div>

      <div className="font-mono text-xs text-glitch-blue/60 mb-2 p-2 bg-glitch-bg/80 border border-glitch-blue/10 overflow-x-auto break-all">
        {log.encodedContent}
      </div>

      <button
        onClick={handleDecode}
        className={`glitch-btn w-full !py-2 !text-xs flex items-center justify-center gap-2 ${
          isDecoded ? '!border-glitch-green !text-glitch-green' : '!border-glitch-magenta !text-glitch-magenta'
        }`}
      >
        {isDecoded ? (
          <>
            <Search className="w-3 h-3" />
            {showDecoded ? '收起解码' : '查看解码'}
          </>
        ) : (
          <>
            <Unlock className="w-3 h-3" />
            解码日志
          </>
        )}
      </button>

      {showDecoded && isDecoded && (
        <div className="mt-2 p-2 border border-glitch-green/30 bg-glitch-green/5 font-mono text-xs text-glitch-green/90 leading-relaxed">
          <div className="text-glitch-yellow/70 mb-1">{'>'} 解码结果：</div>
          <div className="whitespace-pre-wrap">{decodeCipher(log.encodedContent, log.cipher, log.cipherKey)}</div>
          {relatedClues.length > 0 && (
            <div className="mt-2 pt-2 border-t border-glitch-green/20">
              <div className="text-glitch-blue/70 text-[10px] mb-1">此日志揭示的线索：</div>
              {log.clueIds?.map((cid) => (
                <span key={cid} className="inline-block text-[10px] px-1.5 py-0.5 mr-1 mb-1 border border-glitch-blue/30 text-glitch-blue/70">
                  {cid}
                </span>
              ))}
            </div>
          )}
          {log.keyword && (
            <div className="mt-2 pt-2 border-t border-glitch-green/20">
              <div className="text-glitch-magenta/70 text-[10px] mb-1">发现关键词：</div>
              <span className="text-glitch-magenta">{log.keyword}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function KeywordVerifier({ onVerified }: { onVerified?: (kw: KeywordCondition) => void }) {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<'success' | 'fail' | null>(null);
  const [matchedKeyword, setMatchedKeyword] = useState<KeywordCondition | null>(null);
  const { storyPackage, verifyKeyword, verifiedKeywords } = useGameStore();

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!input.trim()) return;
      const success = verifyKeyword(input.trim());
      if (success && storyPackage?.keywords) {
        const matched = matchKeyword(input.trim(), storyPackage.keywords);
        if (matched) {
          setMatchedKeyword(matched);
          onVerified?.(matched);
        }
      }
      setResult(success ? 'success' : 'fail');
      setInput('');
      setTimeout(() => setResult(null), 2500);
    },
    [input, verifyKeyword, storyPackage, onVerified]
  );

  const keywords = storyPackage?.keywords ?? [];

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <span className="text-glitch-green text-shadow-glow-green select-none">{'>'}</span>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="输入关键词..."
          className="glitch-input flex-1"
          autoComplete="off"
          spellCheck={false}
        />
        <button type="submit" className="glitch-btn !py-1 !px-3 !text-xs">
          校验
        </button>
      </form>

      {result === 'success' && matchedKeyword && (
        <div className="flex items-center gap-2 p-2 border border-glitch-green/50 bg-glitch-green/5 text-glitch-green font-mono text-sm animate-blink">
          <CheckCircle className="w-4 h-4" />
          <div>
            <div>关键词验证成功：{matchedKeyword.keyword}</div>
            {matchedKeyword.description && (
              <div className="text-glitch-green/60 text-xs mt-0.5">{matchedKeyword.description}</div>
            )}
          </div>
        </div>
      )}
      {result === 'fail' && (
        <div className="flex items-center gap-2 p-2 border border-glitch-red/50 bg-glitch-red/5 text-glitch-red font-mono text-sm animate-glitch-horizontal">
          <AlertTriangle className="w-4 h-4" />
          关键词验证失败
        </div>
      )}

      <div className="space-y-2">
        <div className="text-glitch-green/50 text-xs font-mono mb-2">
          已验证关键词 ({verifiedKeywords.size}/{keywords.length})
        </div>
        {keywords.length === 0 ? (
          <div className="text-glitch-green/30 text-xs font-mono">暂无关键词记录</div>
        ) : (
          keywords.map((kw) => {
            const verified = verifiedKeywords.has(kw.keyword);
            return (
              <div
                key={kw.keyword}
                className={`flex items-start gap-2 p-2 border font-mono text-xs ${
                  verified
                    ? 'border-glitch-green/40 text-glitch-green'
                    : 'border-glitch-green/10 text-glitch-green/30'
                }`}
              >
                {verified ? (
                  <Key className="w-3 h-3 text-glitch-yellow mt-0.5 flex-shrink-0" />
                ) : (
                  <Lock className="w-3 h-3 mt-0.5 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <span className={verified ? 'text-shadow-glow-green' : ''}>
                    {verified ? kw.keyword : '???'}
                  </span>
                  {kw.description && verified && (
                    <div className="text-glitch-green/50 mt-0.5">- {kw.description}</div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function HiddenTriggerCard({ trigger, checkResult }: { trigger: HiddenNodeTrigger; checkResult: TriggerCheckResult }) {
  const { triggeredHiddenNodes, collectedClues, verifiedKeywords, decodedLogs } = useGameStore();
  const isTriggered = triggeredHiddenNodes.has(trigger.id);

  const clueProgress = trigger.requiredClueIds.filter((id) => collectedClues.has(id)).length;
  const keywordProgress = trigger.requiredKeywordIds.filter((id) => verifiedKeywords.has(id)).length;
  const logProgress = trigger.requiredDecodedLogIds.filter((id) => decodedLogs.has(id)).length;
  const totalRequired =
    trigger.requiredClueIds.length + trigger.requiredKeywordIds.length + trigger.requiredDecodedLogIds.length;
  const totalProgress = clueProgress + keywordProgress + logProgress;

  const handleNavigate = () => {
    const { goToNode } = useGameStore.getState();
    goToNode(trigger.targetNodeId);
  };

  return (
    <div className={`border p-3 bg-glitch-bg/50 transition-colors ${
      isTriggered ? 'border-glitch-yellow/60' : 'border-glitch-green/20'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Puzzle className={`w-4 h-4 ${isTriggered ? 'text-glitch-yellow' : 'text-glitch-green/40'}`} />
          <GlitchText
            text={trigger.name}
            intensity={isTriggered ? 1 : 0}
            className={`font-mono text-sm ${isTriggered ? 'text-glitch-yellow text-shadow-glow-yellow' : 'text-glitch-green/50'}`}
            charGlitch={false}
          />
        </div>
        {isTriggered && <span className="text-xs text-glitch-yellow animate-blink">已解锁</span>}
      </div>
      {trigger.description && (
        <div className="text-glitch-green/50 text-xs font-mono mb-2">{trigger.description}</div>
      )}
      <div className="space-y-1.5">
        {trigger.requiredClueIds.length > 0 && (
          <div className="flex items-center gap-2 text-xs font-mono">
            <FileText className="w-3 h-3 text-glitch-blue" />
            <span className={clueProgress === trigger.requiredClueIds.length ? 'text-glitch-green' : 'text-glitch-green/40'}>
              线索 {clueProgress}/{trigger.requiredClueIds.length}
            </span>
            {checkResult.missingClues.length > 0 && checkResult.missingClues.length < trigger.requiredClueIds.length && (
              <span className="text-glitch-yellow/50 ml-auto">
                缺 {checkResult.missingClues.length}
              </span>
            )}
          </div>
        )}
        {trigger.requiredKeywordIds.length > 0 && (
          <div className="flex items-center gap-2 text-xs font-mono">
            <Key className="w-3 h-3 text-glitch-magenta" />
            <span className={keywordProgress === trigger.requiredKeywordIds.length ? 'text-glitch-green' : 'text-glitch-green/40'}>
              关键词 {keywordProgress}/{trigger.requiredKeywordIds.length}
            </span>
            {checkResult.missingKeywords.length > 0 && checkResult.missingKeywords.length < trigger.requiredKeywordIds.length && (
              <span className="text-glitch-yellow/50 ml-auto">
                缺 {checkResult.missingKeywords.length}
              </span>
            )}
          </div>
        )}
        {trigger.requiredDecodedLogIds.length > 0 && (
          <div className="flex items-center gap-2 text-xs font-mono">
            <Search className="w-3 h-3 text-glitch-yellow" />
            <span className={logProgress === trigger.requiredDecodedLogIds.length ? 'text-glitch-green' : 'text-glitch-green/40'}>
              已解码日志 {logProgress}/{trigger.requiredDecodedLogIds.length}
            </span>
            {checkResult.missingLogs.length > 0 && checkResult.missingLogs.length < trigger.requiredDecodedLogIds.length && (
              <span className="text-glitch-yellow/50 ml-auto">
                缺 {checkResult.missingLogs.length}
              </span>
            )}
          </div>
        )}
      </div>
      <div className="mt-2 w-full h-1 bg-glitch-green/10">
        <div
          className={`h-full transition-all ${isTriggered ? 'bg-glitch-yellow' : 'bg-glitch-green/50'}`}
          style={{ width: `${totalRequired > 0 ? (totalProgress / totalRequired) * 100 : 0}%` }}
        />
      </div>
      {isTriggered && (
        <button
          onClick={handleNavigate}
          className="glitch-btn w-full !py-2 !text-xs !border-glitch-yellow !text-glitch-yellow mt-2 flex items-center justify-center gap-2"
        >
          <Unlock className="w-3 h-3" />
          前往隐藏节点
        </button>
      )}
    </div>
  );
}

interface EvidencePanelProps {
  onClose: () => void;
  onKeywordVerified?: (kw: KeywordCondition) => void;
}

export function EvidencePanel({ onClose, onKeywordVerified }: EvidencePanelProps) {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const {
    storyPackage,
    collectedClues,
    decodedLogs,
    verifiedKeywords,
    triggeredHiddenNodes,
    getAvailableLogs,
    decodeLog,
    isLogDecoded,
  } = useGameStore();

  const clues = storyPackage?.evidenceClues ?? [];
  const logs = getAvailableLogs();
  const triggers = storyPackage?.hiddenNodeTriggers ?? [];
  const collectedClueItems = clues.filter((c) => collectedClues.has(c.id));

  const progress = useMemo(
    () => calculatePuzzleProgress(storyPackage, collectedClues, decodedLogs, verifiedKeywords, triggeredHiddenNodes),
    [storyPackage, collectedClues, decodedLogs, verifiedKeywords, triggeredHiddenNodes]
  );

  const relations = useMemo(() => buildEvidenceRelations(storyPackage), [storyPackage]);

  const triggerResults = useMemo(
    () => triggers.map((t) => checkTriggerStatus(t, collectedClues, verifiedKeywords, decodedLogs)),
    [triggers, collectedClues, verifiedKeywords, decodedLogs]
  );

  const tabs: { id: TabId; label: string; count: number; icon: typeof FileText }[] = [
    { id: 'overview', label: '总览', count: progress.overallPercent, icon: LayoutDashboard },
    { id: 'clues', label: '线索', count: collectedClueItems.length, icon: FileText },
    { id: 'logs', label: '日志', count: logs.filter((l) => isLogDecoded(l.id)).length, icon: Search },
    {
      id: 'keywords',
      label: '关键词',
      count: (storyPackage?.keywords ?? []).filter((kw) => verifiedKeywords.has(kw.keyword)).length,
      icon: Key,
    },
    {
      id: 'triggers',
      label: '触发',
      count: triggers.filter((t) => triggeredHiddenNodes.has(t.id)).length,
      icon: Puzzle,
    },
  ];

  const handleDecodeLog = useCallback(
    (logId: string) => {
      decodeLog(logId);
    },
    [decodeLog]
  );

  return (
    <div className="border border-glitch-green/30 bg-glitch-bg/95 backdrop-blur">
      <div className="flex items-center justify-between px-4 py-2 border-b border-glitch-green/20">
        <GlitchText
          text="EVIDENCE://证据拼图"
          intensity={0.5}
          className="font-display text-sm text-glitch-green text-shadow-glow-green"
          charGlitch={false}
        />
        <button onClick={onClose} className="text-glitch-green/50 hover:text-glitch-red text-xs font-mono">
          [关闭]
        </button>
      </div>

      <div className="flex border-b border-glitch-green/20 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isOverview = tab.id === 'overview';
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-mono transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-glitch-green bg-glitch-green/10 border-b-2 border-glitch-green text-shadow-glow-green'
                  : 'text-glitch-green/40 hover:text-glitch-green/70'
              }`}
            >
              <Icon className="w-3 h-3" />
              {tab.label}
              <span className={`text-[10px] ${activeTab === tab.id ? 'text-glitch-yellow' : 'text-glitch-green/30'}`}>
                ({isOverview ? `${tab.count}%` : tab.count})
              </span>
            </button>
          );
        })}
      </div>

      <div className="p-3 max-h-[55vh] overflow-y-auto scrollbar-thin">
        {activeTab === 'overview' && (
          <PuzzleOverview progress={progress} relations={relations} triggerResults={triggerResults} />
        )}

        {activeTab === 'clues' && (
          <div className="space-y-2">
            {clues.length === 0 ? (
              <div className="text-glitch-green/30 text-xs font-mono text-center py-4">此剧本无证据线索</div>
            ) : (
              clues.map((clue) => (
                <ClueItem
                  key={clue.id}
                  clue={clue}
                  relations={relations}
                  collectedClues={collectedClues}
                />
              ))
            )}
            {clues.length > collectedClueItems.length && (
              <div className="text-glitch-green/30 text-xs font-mono text-center pt-2">
                还有 {clues.length - collectedClueItems.length} 条线索未发现
              </div>
            )}
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="space-y-2">
            {logs.length === 0 ? (
              <div className="text-glitch-green/30 text-xs font-mono text-center py-4">暂无可用日志</div>
            ) : (
              logs.map((log) => (
                <EncodedLogCard
                  key={log.id}
                  log={log}
                  isDecoded={isLogDecoded(log.id)}
                  onDecode={handleDecodeLog}
                  relations={relations}
                />
              ))
            )}
          </div>
        )}

        {activeTab === 'keywords' && <KeywordVerifier onVerified={onKeywordVerified} />}

        {activeTab === 'triggers' && (
          <div className="space-y-2">
            {triggers.length === 0 ? (
              <div className="text-glitch-green/30 text-xs font-mono text-center py-4">暂无隐藏节点触发条件</div>
            ) : (
              triggers.map((trigger, idx) => (
                <HiddenTriggerCard key={trigger.id} trigger={trigger} checkResult={triggerResults[idx]} />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
