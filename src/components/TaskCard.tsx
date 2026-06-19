import type { BranchTask, Contact } from '../data/types';
import { useGameStore } from '../store/gameStore';
import {
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  PlayCircle,
  X,
  ChevronRight,
  Award,
  Lock,
  User,
} from 'lucide-react';

interface TaskCardProps {
  task: BranchTask;
  issuer?: Contact | null;
  onAccept?: () => void;
  onComplete?: () => void;
  onReject?: () => void;
  onFail?: () => void;
  onView?: () => void;
  showActions?: boolean;
}

const priorityColors = {
  low: 'border-glitch-blue/50 text-glitch-blue',
  medium: 'border-glitch-green/50 text-glitch-green',
  high: 'border-glitch-yellow/50 text-glitch-yellow',
  critical: 'border-glitch-red/50 text-glitch-red animate-pulse',
};

const priorityLabels = {
  low: '低',
  medium: '中',
  high: '高',
  critical: '紧急',
};

const statusIcons = {
  pending: Clock,
  accepted: PlayCircle,
  in_progress: PlayCircle,
  completed: CheckCircle,
  failed: XCircle,
  expired: XCircle,
};

const statusColors = {
  pending: 'text-glitch-blue',
  accepted: 'text-glitch-yellow',
  in_progress: 'text-glitch-yellow',
  completed: 'text-glitch-green',
  failed: 'text-glitch-red',
  expired: 'text-gray-500',
};

const statusLabels = {
  pending: '待处理',
  accepted: '已接受',
  in_progress: '进行中',
  completed: '已完成',
  failed: '已失败',
  expired: '已过期',
};

export function TaskCard({
  task,
  issuer,
  onAccept,
  onComplete,
  onReject,
  onFail,
  onView,
  showActions = true,
}: TaskCardProps) {
  const { checkTaskRequirements, hasClue, isKeywordVerified, hasFlag, getReputation } = useGameStore();
  const canAccept = checkTaskRequirements(task);

  const StatusIcon = statusIcons[task.status];
  const statusColor = statusColors[task.status];
  const statusLabel = statusLabels[task.status];
  const priorityColor = priorityColors[task.priority];
  const priorityLabel = priorityLabels[task.priority];

  const isActive = task.status === 'pending' || task.status === 'accepted' || task.status === 'in_progress';
  const isCompleted = task.status === 'completed';
  const isFailed = task.status === 'failed' || task.status === 'expired';

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRequirementStatus = () => {
    const requirements = [];
    if (task.requiredClueIds) {
      for (const clueId of task.requiredClueIds) {
        requirements.push({
          label: `线索: ${clueId}`,
          met: hasClue(clueId),
        });
      }
    }
    if (task.requiredKeywordIds) {
      for (const kwId of task.requiredKeywordIds) {
        requirements.push({
          label: `关键词: ${kwId}`,
          met: isKeywordVerified(kwId),
        });
      }
    }
    if (task.requiredFlags) {
      for (const flag of task.requiredFlags) {
        requirements.push({
          label: `标记: ${flag}`,
          met: hasFlag(flag),
        });
      }
    }
    if (task.requiredReputation) {
      for (const rep of task.requiredReputation) {
        const currentRep = getReputation(rep.factionId);
        const faction = useGameStore.getState().storyPackage?.factions?.find((f) => f.id === rep.factionId);
        const met =
          (rep.minReputation === undefined || currentRep >= rep.minReputation) &&
          (rep.maxReputation === undefined || currentRep <= rep.maxReputation);
        requirements.push({
          label: `声望: ${faction?.name ?? rep.factionId}`,
          met,
        });
      }
    }
    return requirements;
  };

  const requirements = getRequirementStatus();

  return (
    <div
      className={`relative bg-glitch-bg border ${
        isCompleted
          ? 'border-glitch-green/60'
          : isFailed
          ? 'border-glitch-red/60'
          : priorityColor.split(' ')[0]
      } p-4 rounded-sm transition-all duration-200 ${
        isActive ? 'cursor-pointer hover:border-glitch-green/60' : ''
      }`}
      onClick={isActive && onView ? onView : undefined}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`${statusColor}`}>
            <StatusIcon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-display text-lg text-glitch-green">{task.title}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xs px-2 py-0.5 border ${priorityColor}`}>
                {priorityLabel}优先级
              </span>
              <span className={`text-xs ${statusColor}`}>
                {statusLabel}
              </span>
            </div>
          </div>
        </div>
        {isActive && (
          <ChevronRight className="w-5 h-5 text-glitch-green/50" />
        )}
      </div>

      <p className="text-sm text-glitch-green/80 font-mono mb-3 line-clamp-3">
        {task.description}
      </p>

      {issuer && (
        <div className="flex items-center gap-2 mb-3 text-xs text-glitch-green/60">
          <User className="w-4 h-4" />
          <span>发布者: {issuer.name}</span>
        </div>
      )}

      {requirements.length > 0 && (
        <div className="mb-3 p-3 bg-glitch-dark/50 border border-glitch-green/20 rounded-sm">
          <div className="text-xs text-glitch-green/60 mb-2 font-mono">前置要求:</div>
          <div className="space-y-1">
            {requirements.map((req, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs">
                {req.met ? (
                  <CheckCircle className="w-3 h-3 text-glitch-green" />
                ) : (
                  <Lock className="w-3 h-3 text-glitch-red" />
                )}
                <span className={req.met ? 'text-glitch-green/80' : 'text-glitch-red/80'}>
                  {req.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {(task.rewardClueIds || task.rewardFlags || task.rewardReputation) && isActive && (
        <div className="mb-3 p-3 bg-glitch-dark/50 border border-glitch-yellow/20 rounded-sm">
          <div className="flex items-center gap-2 text-xs text-glitch-yellow/80 mb-2 font-mono">
            <Award className="w-4 h-4" />
            <span>任务奖励:</span>
          </div>
          <div className="space-y-1">
            {task.rewardClueIds?.map((clueId, idx) => (
              <div key={idx} className="text-xs text-glitch-yellow/60">
                + 线索: {clueId}
              </div>
            ))}
            {task.rewardFlags?.map((flag, idx) => (
              <div key={idx} className="text-xs text-glitch-yellow/60">
                + 标记: {flag}
              </div>
            ))}
            {task.rewardReputation?.map((rep, idx) => {
              const faction = useGameStore.getState().storyPackage?.factions?.find((f) => f.id === rep.factionId);
              return (
                <div key={idx} className="text-xs text-glitch-yellow/60">
                  + 声望: {faction?.name ?? rep.factionId} {rep.change > 0 ? '+' : ''}{rep.change}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-glitch-green/40 font-mono">
        <span>创建: {formatDate(task.createdAt)}</span>
        {task.deadline && (
          <span className="flex items-center gap-1 text-glitch-yellow/60">
            <Clock className="w-3 h-3" />
            截止: {formatDate(task.deadline)}
          </span>
        )}
      </div>

      {showActions && task.status === 'pending' && (
        <div className="flex gap-2 mt-4 pt-4 border-t border-glitch-green/20">
          <button
            className={`glitch-btn !py-2 !px-4 flex-1 text-sm ${
              !canAccept ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            onClick={(e) => {
              e.stopPropagation();
              if (canAccept) onAccept?.();
            }}
            disabled={!canAccept}
          >
            接受任务
          </button>
          {task.nextNodeIdOnReject && (
            <button
              className="glitch-btn !py-2 !px-4 flex-1 text-sm !border-glitch-red/50 !text-glitch-red hover:!bg-glitch-red/20"
              onClick={(e) => {
                e.stopPropagation();
                onReject?.();
              }}
            >
              <X className="w-4 h-4 inline mr-1" />
              拒绝
            </button>
          )}
        </div>
      )}

      {showActions && task.status === 'accepted' && (
        <div className="flex gap-2 mt-4 pt-4 border-t border-glitch-green/20">
          <button
            className="glitch-btn !py-2 !px-4 flex-1 text-sm"
            onClick={(e) => {
              e.stopPropagation();
              onComplete?.();
            }}
          >
            完成任务
          </button>
          <button
            className="glitch-btn !py-2 !px-4 flex-1 text-sm !border-glitch-red/50 !text-glitch-red hover:!bg-glitch-red/20"
            onClick={(e) => {
              e.stopPropagation();
              onFail?.();
            }}
          >
            <AlertTriangle className="w-4 h-4 inline mr-1" />
            标记失败
          </button>
        </div>
      )}

      {isCompleted && (
        <div className="mt-4 pt-4 border-t border-glitch-green/20 text-center">
          <span className="text-glitch-green text-sm font-mono">
            ✓ 任务已完成 - {formatDate(task.completedAt)}
          </span>
        </div>
      )}

      {isFailed && (
        <div className="mt-4 pt-4 border-t border-glitch-red/20 text-center">
          <span className="text-glitch-red text-sm font-mono">
            ✗ 任务已失败
          </span>
        </div>
      )}
    </div>
  );
}
