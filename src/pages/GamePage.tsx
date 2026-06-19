import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { HUD } from '../components/HUD';
import { TerminalWindow } from '../components/TerminalWindow';
import { StoryDisplay } from '../components/StoryDisplay';
import { BranchChoice } from '../components/BranchChoice';
import { TextInput } from '../components/TextInput';
import { GlitchText } from '../components/GlitchText';
import { IncomingCallOverlay } from '../components/IncomingCallOverlay';
import { CommunicationHUD } from '../components/CommunicationHUD';
import { useGameStore } from '../store/gameStore';
import { useAudio } from '../hooks/useAudio';
import type { StoryNode, Choice, Ending, FactionReputationChange, KeywordCondition } from '../data/types';
import { ArrowLeft, Save, FileText, Search, Key, MessageSquare, ClipboardList, UserCheck } from 'lucide-react';

export function GamePage() {
  const navigate = useNavigate();
  const { play } = useAudio();
  const {
    storyPackage,
    currentNodeId,
    goToNode,
    setFlag,
    recordEnding,
    changeReputation,
    collectCluesFromNode,
    pendingHiddenTriggers,
    dismissPendingTrigger,
    getTriggerById,
    getClueById,
    getLogById,
    decodedLogs,
    verifiedKeywords,
    activeCall,
    answerCall,
    rejectCall,
    pendingMessages,
    pendingTasks,
    checkCommunicationTriggers,
    getContactById,
    getConversationById,
    getTaskById,
    dismissPendingMessage,
    dismissPendingTask,
    unlockContact,
    getUnreadMessageCount,
  } = useGameStore();

  const [currentNode, setCurrentNode] = useState<StoryNode | null>(null);
  const [isTextComplete, setIsTextComplete] = useState(false);
  const [endingShown, setEndingShown] = useState<Ending | null>(null);
  const [saveNotice, setSaveNotice] = useState(false);
  const [reputationNotice, setReputationNotice] = useState<FactionReputationChange[] | null>(null);
  const [clueNotice, setClueNotice] = useState<string[]>([]);
  const [hiddenTriggerNotice, setHiddenTriggerNotice] = useState<string | null>(null);
  const [logDecodeNotice, setLogDecodeNotice] = useState<string | null>(null);
  const [keywordVerifyNotice, setKeywordVerifyNotice] = useState<KeywordCondition | null>(null);
  const [newMessageNotice, setNewMessageNotice] = useState<string | null>(null);
  const [newTaskNotice, setNewTaskNotice] = useState<string | null>(null);
  const [contactUnlockNotice, setContactUnlockNotice] = useState<string | null>(null);

  const prevDecodedLogsRef = useRef<Set<string>>(new Set());
  const prevVerifiedKeywordsRef = useRef<Set<string>>(new Set());
  const prevPendingMessagesRef = useRef<Set<string>>(new Set());
  const prevPendingTasksRef = useRef<Set<string>>(new Set());
  const checkTriggersRef = useRef<number | null>(null);

  useEffect(() => {
    if (!storyPackage) {
      navigate('/');
      return;
    }
    if (!currentNodeId) {
      navigate('/');
      return;
    }
    const node = storyPackage.nodes[currentNodeId];
    if (node) {
      setCurrentNode(node);
      setIsTextComplete(false);
      setEndingShown(null);

      if (node.collectClues && node.collectClues.length > 0) {
        const newClues = collectCluesFromNode(currentNodeId);
        if (newClues.length > 0) {
          const clueNames = newClues
            .map((id) => getClueById(id)?.title ?? id)
            .filter(Boolean);
          setClueNotice(clueNames);
          play('choice');
          setTimeout(() => setClueNotice([]), 3000);
        }
      }
    }
  }, [storyPackage, currentNodeId, navigate, collectCluesFromNode, getClueById, play]);

  useEffect(() => {
    if (pendingHiddenTriggers.length > 0) {
      const triggerId = pendingHiddenTriggers[0];
      const trigger = getTriggerById(triggerId);
      if (trigger) {
        setHiddenTriggerNotice(trigger.name);
        play('glitch');
        setTimeout(() => {
          setHiddenTriggerNotice(null);
          dismissPendingTrigger(triggerId);
        }, 4000);
      }
    }
  }, [pendingHiddenTriggers, getTriggerById, dismissPendingTrigger, play]);

  useEffect(() => {
    const prevDecoded = prevDecodedLogsRef.current;
    for (const logId of decodedLogs) {
      if (!prevDecoded.has(logId)) {
        const log = getLogById(logId);
        if (log) {
          setLogDecodeNotice(log.title);
          play('choice');
          setTimeout(() => setLogDecodeNotice(null), 3000);
        }
      }
    }
    prevDecodedLogsRef.current = new Set(decodedLogs);
  }, [decodedLogs, getLogById, play]);

  useEffect(() => {
    const prevVerified = prevVerifiedKeywordsRef.current;
    for (const kw of verifiedKeywords) {
      if (!prevVerified.has(kw)) {
        const keywordData = storyPackage?.keywords?.find((k) => k.keyword === kw);
        if (keywordData) {
          setKeywordVerifyNotice(keywordData);
          play('choice');
          setTimeout(() => setKeywordVerifyNotice(null), 3000);
        }
      }
    }
    prevVerifiedKeywordsRef.current = new Set(verifiedKeywords);
  }, [verifiedKeywords, storyPackage, play]);

  useEffect(() => {
    checkTriggersRef.current = window.setInterval(() => {
      checkCommunicationTriggers();
    }, 2000);
    return () => {
      if (checkTriggersRef.current !== null) {
        window.clearInterval(checkTriggersRef.current);
      }
    };
  }, [checkCommunicationTriggers]);

  useEffect(() => {
    if (activeCall) {
      play('ring');
    }
  }, [activeCall, play]);

  useEffect(() => {
    const prevMessages = prevPendingMessagesRef.current;
    for (const convId of pendingMessages) {
      if (!prevMessages.has(convId)) {
        const conv = getConversationById(convId);
        const contact = conv ? getContactById(conv.contactId) : null;
        if (contact) {
          setNewMessageNotice(contact.name);
          play('message');
          setTimeout(() => setNewMessageNotice(null), 3000);
        }
      }
    }
    prevPendingMessagesRef.current = new Set(pendingMessages);
  }, [pendingMessages, getConversationById, getContactById, play]);

  useEffect(() => {
    const prevTasks = prevPendingTasksRef.current;
    for (const taskId of pendingTasks) {
      if (!prevTasks.has(taskId)) {
        const task = getTaskById(taskId);
        if (task) {
          setNewTaskNotice(task.title);
          play('glitch');
          setTimeout(() => setNewTaskNotice(null), 4000);
        }
      }
    }
    prevPendingTasksRef.current = new Set(pendingTasks);
  }, [pendingTasks, getTaskById, play]);

  const handleAnswerCall = useCallback(() => {
    if (activeCall) {
      play('choice');
      answerCall(activeCall.id);
    }
  }, [activeCall, answerCall, play]);

  const handleRejectCall = useCallback(() => {
    if (activeCall) {
      play('error');
      rejectCall(activeCall.id);
    }
  }, [activeCall, rejectCall, play]);

  const handleViewMessages = useCallback(() => {
    const convId = pendingMessages[0];
    if (convId) {
      dismissPendingMessage(convId);
      navigate(`/chat/${convId}`);
    }
  }, [pendingMessages, dismissPendingMessage, navigate]);

  const handleViewTasks = useCallback(() => {
    const taskId = pendingTasks[0];
    if (taskId) {
      dismissPendingTask(taskId);
      navigate('/tasks');
    }
  }, [pendingTasks, dismissPendingTask, navigate]);

  const handleTextComplete = useCallback(() => {
    setIsTextComplete(true);
    if (currentNode?.type === 'ending' && currentNode.ending) {
      recordEnding(currentNode.ending.id);
      setEndingShown(currentNode.ending);
      play('ending');
    }
  }, [currentNode, recordEnding, play]);

  const handleNarrativeContinue = useCallback(() => {
    if (!currentNode || currentNode.type !== 'narrative' || !isTextComplete) return;
    if (currentNode.nextId) {
      goToNode(currentNode.nextId);
    }
  }, [currentNode, isTextComplete, goToNode]);

  const handleChoiceSelect = useCallback(
    (choice: Choice) => {
      play('choice');
      if (choice.setFlag) {
        setFlag(choice.setFlag);
      }
      if (choice.reputationChanges && choice.reputationChanges.length > 0) {
        const applied = changeReputation(choice.reputationChanges);
        if (applied.length > 0) {
          setReputationNotice(applied);
          setTimeout(() => setReputationNotice(null), 2500);
        }
      }
      goToNode(choice.nextId, choice.id);
    },
    [play, setFlag, goToNode, changeReputation]
  );

  const handleInputSubmit = useCallback(
    (value: string) => {
      if (!currentNode || currentNode.type !== 'input') return;
      const keyword = currentNode.inputKeyword;
      if (!keyword) {
        if (currentNode.nextId) goToNode(currentNode.nextId);
        return;
      }
      const regex = new RegExp(keyword, 'i');
      if (regex.test(value)) {
        play('choice');
        if (currentNode.nextId) goToNode(currentNode.nextId);
      } else {
        play('error');
        if (currentNode.inputFailureNextId) {
          goToNode(currentNode.inputFailureNextId);
        }
      }
    },
    [currentNode, play, goToNode]
  );

  const handleSave = () => {
    setSaveNotice(true);
    play('choice');
    setTimeout(() => setSaveNotice(false), 1500);
  };

  const handleRestart = () => {
    navigate('/');
  };

  if (!currentNode) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <GlitchText text="加载中..." intensity={2} className="text-2xl text-glitch-green" />
      </div>
    );
  }

  if (endingShown) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center p-4">
        <TerminalWindow
          title={`ENDING://${endingShown.id}`}
          className="max-w-2xl"
        >
          <div className="p-6 sm:p-10 flex flex-col items-center gap-6 text-center">
            <div>
              <GlitchText
                text="=== 结局达成 ==="
                intensity={1}
                className="font-display text-xl sm:text-2xl text-glitch-yellow text-shadow-glow-yellow"
                charGlitch={false}
              />
            </div>
            <GlitchText
              text={endingShown.title}
              intensity={2}
              className="font-display text-3xl sm:text-4xl text-glitch-magenta text-shadow-glow-red"
            />
            <div className="max-w-lg mt-4 text-glitch-green/90 font-mono leading-relaxed text-shadow-glow-green">
              {endingShown.description}
            </div>
            {endingShown.isHidden && (
              <div className="mt-2 text-glitch-yellow text-sm font-mono animate-blink text-shadow-glow-yellow">
                ★ 隐藏结局解锁 ★
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-3 mt-6 w-full max-w-sm">
              <button onClick={handleRestart} className="glitch-btn flex items-center justify-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                返回主菜单
              </button>
            </div>
          </div>
        </TerminalWindow>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col">
      <HUD onSave={handleSave} />

      {saveNotice && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-glitch-bg border border-glitch-green px-4 py-2 text-glitch-green font-mono text-sm text-shadow-glow-green animate-glitch-horizontal">
          <Save className="w-4 h-4 inline mr-2" />
          游戏已保存
        </div>
      )}

      {clueNotice.length > 0 && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-glitch-bg border border-glitch-yellow px-4 py-2 text-glitch-yellow font-mono text-sm text-shadow-glow-yellow animate-glitch-horizontal">
          <FileText className="w-4 h-4 inline mr-2" />
          发现线索：{clueNotice.join('、')}
        </div>
      )}

      {logDecodeNotice && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-glitch-bg border border-glitch-blue px-4 py-2 text-glitch-blue font-mono text-sm text-shadow-glow-green animate-glitch-horizontal">
          <Search className="w-4 h-4 inline mr-2" />
          日志已解码：{logDecodeNotice}
        </div>
      )}

      {keywordVerifyNotice && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-glitch-bg border border-glitch-magenta px-4 py-2 text-glitch-magenta font-mono text-sm text-shadow-glow-red animate-glitch-horizontal">
          <Key className="w-4 h-4 inline mr-2" />
          关键词验证成功：{keywordVerifyNotice.keyword}
        </div>
      )}

      {hiddenTriggerNotice && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-glitch-bg border-2 border-glitch-yellow px-6 py-4 font-mono animate-glitch-horizontal text-center">
          <GlitchText
            text="★ 隐藏节点解锁 ★"
            intensity={2}
            className="text-glitch-yellow text-shadow-glow-yellow block text-sm"
            charGlitch={false}
          />
          <div className="text-glitch-yellow/80 text-xs mt-2">{hiddenTriggerNotice}</div>
        </div>
      )}

      {contactUnlockNotice && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-glitch-bg border-2 border-glitch-blue px-4 py-2 text-glitch-blue font-mono text-sm text-shadow-glow-blue animate-glitch-horizontal">
          <UserCheck className="w-4 h-4 inline mr-2" />
          新联系人解锁：{contactUnlockNotice}
        </div>
      )}

      {newMessageNotice && (
        <div
          onClick={handleViewMessages}
          className="fixed top-16 right-4 z-50 bg-glitch-bg border-2 border-glitch-blue px-4 py-2 text-glitch-blue font-mono text-sm text-shadow-glow-blue animate-glitch-horizontal cursor-pointer hover:bg-glitch-blue/10 transition-colors"
        >
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 animate-pulse" />
            <div>
              <div>新消息来自 {newMessageNotice}</div>
              <div className="text-xs text-glitch-blue/70">点击查看</div>
            </div>
          </div>
        </div>
      )}

      {newTaskNotice && (
        <div
          onClick={handleViewTasks}
          className="fixed top-32 right-4 z-50 bg-glitch-bg border-2 border-glitch-magenta px-4 py-2 text-glitch-magenta font-mono text-sm text-shadow-glow-red animate-glitch-horizontal cursor-pointer hover:bg-glitch-magenta/10 transition-colors"
        >
          <div className="flex items-center gap-2">
            <ClipboardList className="w-4 h-4 animate-pulse" />
            <div>
              <div>新任务：{newTaskNotice}</div>
              <div className="text-xs text-glitch-magenta/70">点击查看</div>
            </div>
          </div>
        </div>
      )}

      {reputationNotice && reputationNotice.length > 0 && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-glitch-bg border px-4 py-2 font-mono text-sm animate-glitch-horizontal flex flex-col gap-1 min-w-[200px]"
          style={{
            borderColor: reputationNotice.some((c) => c.change > 0) ? '#00ff66' : '#ff0055',
          }}
        >
          {reputationNotice.map((change, idx) => {
            const faction = storyPackage?.factions?.find((f) => f.id === change.factionId);
            const name = faction?.name ?? change.factionId;
            const color = change.change > 0 ? '#00ff66' : '#ff0055';
            const sign = change.change > 0 ? '+' : '';
            return (
              <div key={idx} style={{ color, textShadow: `0 0 8px ${color}` }}>
                {name} {sign}{change.change}
              </div>
            );
          })}
        </div>
      )}

      {activeCall && (
        <IncomingCallOverlay
          call={activeCall}
          contact={getContactById(activeCall.callerId)}
          onAnswer={handleAnswerCall}
          onReject={handleRejectCall}
        />
      )}

      <div className="fixed bottom-4 right-4 z-30">
        <CommunicationHUD vertical={true} showLabels={false} />
      </div>

      <div className="flex-1 w-full flex items-center justify-center p-4 sm:p-8 pb-32">
        <TerminalWindow
          title={`node://${currentNode.id} [ch.${currentNode.chapter ?? 1}]`}
          className="w-full"
        >
          <div className="p-4 sm:p-6">
            <StoryDisplay node={currentNode} onComplete={handleTextComplete} />

            {currentNode.type === 'narrative' && isTextComplete && currentNode.nextId && (
              <div className="px-4 pb-4">
                <button
                  onClick={handleNarrativeContinue}
                  className="glitch-btn w-full !py-3 flex items-center justify-center gap-2"
                >
                  继续 →
                </button>
              </div>
            )}

            {currentNode.type === 'choice' && isTextComplete && currentNode.choices && (
              <div className="px-4 pb-4">
                <BranchChoice
                  choices={currentNode.choices}
                  onSelect={handleChoiceSelect}
                  disabled={!isTextComplete}
                />
              </div>
            )}

            {currentNode.type === 'input' && isTextComplete && (
              <div className="px-4 pb-6">
                <TextInput
                  hint={currentNode.inputHint ?? '> 输入指令...'}
                  onSubmit={handleInputSubmit}
                  disabled={!isTextComplete}
                  onTyping={() => play('typing')}
                  onError={() => play('error')}
                />
              </div>
            )}
          </div>
        </TerminalWindow>
      </div>
    </div>
  );
}
