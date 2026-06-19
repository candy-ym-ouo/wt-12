import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { TaskCard } from '../components/TaskCard';
import { CommunicationHUD } from '../components/CommunicationHUD';
import { TerminalWindow } from '../components/TerminalWindow';
import { GlitchText } from '../components/GlitchText';
import { ArrowLeft, ClipboardList, AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';

export function TasksPage() {
  const navigate = useNavigate();
  const {
    storyPackage,
    getTasks,
    getTaskById,
    getContactById,
    acceptTask,
    completeTask,
    rejectTask,
    failTask,
    pendingTasks,
    dismissPendingTask,
  } = useGameStore();

  const [filter, setFilter] = useState<'all' | 'pending' | 'active' | 'completed' | 'failed'>('all');
  const [newTaskNotice, setNewTaskNotice] = useState<string | null>(null);

  useEffect(() => {
    if (pendingTasks.length > 0) {
      const taskId = pendingTasks[0];
      const task = getTaskById(taskId);
      if (task) {
        setNewTaskNotice(task.title);
        setTimeout(() => {
          setNewTaskNotice(null);
        }, 3000);
      }
    }
  }, [pendingTasks, getTaskById]);

  const tasks = getTasks();

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'all') return true;
    if (filter === 'pending') return task.status === 'pending';
    if (filter === 'active') return task.status === 'accepted' || task.status === 'in_progress';
    if (filter === 'completed') return task.status === 'completed';
    if (filter === 'failed') return task.status === 'failed' || task.status === 'expired';
    return true;
  });

  const handleAccept = (taskId: string) => {
    acceptTask(taskId);
    dismissPendingTask(taskId);
  };

  const handleComplete = (taskId: string) => {
    completeTask(taskId);
  };

  const handleReject = (taskId: string) => {
    rejectTask(taskId);
    dismissPendingTask(taskId);
  };

  const handleFail = (taskId: string) => {
    failTask(taskId);
  };

  const handleView = (taskId: string) => {
    const task = getTaskById(taskId);
    if (task?.status === 'accepted' && task.nextNodeIdOnAccept) {
      navigate('/game');
    }
  };

  if (!storyPackage) {
    navigate('/');
    return null;
  }

  const filterOptions = [
    { key: 'all', label: '全部', icon: ClipboardList },
    { key: 'pending', label: '待处理', icon: AlertCircle },
    { key: 'active', label: '进行中', icon: Clock },
    { key: 'completed', label: '已完成', icon: CheckCircle },
    { key: 'failed', label: '已失败', icon: XCircle },
  ];

  return (
    <div className="min-h-screen w-full flex flex-col">
      {newTaskNotice && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-glitch-bg border-2 border-glitch-magenta px-6 py-4 font-mono animate-glitch-horizontal">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-glitch-magenta" />
            <span className="text-glitch-magenta">新任务: {newTaskNotice}</span>
          </div>
        </div>
      )}

      <div className="p-4 border-b border-glitch-green/30">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/game')}
              className="glitch-btn !py-2 !px-3 flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              返回
            </button>
            <div className="flex items-center gap-2">
              <ClipboardList className="w-6 h-6 text-glitch-magenta" />
              <GlitchText
                text="TASKS://任务中心"
                intensity={1}
                className="font-display text-xl text-glitch-magenta text-shadow-glow-red"
              />
            </div>
          </div>
          <CommunicationHUD showLabels={false} />
        </div>
      </div>

      <div className="flex-1 w-full p-4 sm:p-8">
        <div className="max-w-4xl mx-auto">
          <TerminalWindow title="mission_control.sys" className="w-full">
            <div className="p-4 sm:p-6">
              <div className="flex flex-wrap gap-2 mb-6">
                {filterOptions.map(({ key, label, icon: Icon }) => {
                  const count = tasks.filter((t) => {
                    if (key === 'all') return true;
                    if (key === 'pending') return t.status === 'pending';
                    if (key === 'active') return t.status === 'accepted' || t.status === 'in_progress';
                    if (key === 'completed') return t.status === 'completed';
                    if (key === 'failed') return t.status === 'failed' || t.status === 'expired';
                    return false;
                  }).length;

                  return (
                    <button
                      key={key}
                      onClick={() => setFilter(key as typeof filter)}
                      className={`flex items-center gap-2 px-4 py-2 text-sm font-mono border transition-all whitespace-nowrap ${
                        filter === key
                          ? 'border-glitch-magenta bg-glitch-magenta/20 text-glitch-magenta'
                          : 'border-glitch-green/30 text-glitch-green/60 hover:border-glitch-magenta/60'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {label}
                      {count > 0 && (
                        <span
                          className={`ml-1 px-2 py-0.5 text-xs rounded-full ${
                            filter === key
                              ? 'bg-glitch-magenta/30 text-glitch-magenta'
                              : 'bg-glitch-green/10 text-glitch-green/60'
                          }`}
                        >
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {filteredTasks.length > 0 ? (
                <div className="space-y-4">
                  {filteredTasks.map((task) => {
                    const issuer = getContactById(task.issuerId);
                    return (
                      <TaskCard
                        key={task.id}
                        task={task}
                        issuer={issuer}
                        onAccept={() => handleAccept(task.id)}
                        onComplete={() => handleComplete(task.id)}
                        onReject={() => handleReject(task.id)}
                        onFail={() => handleFail(task.id)}
                        onView={() => handleView(task.id)}
                        showActions={true}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <ClipboardList className="w-16 h-16 text-glitch-magenta/30 mx-auto mb-4" />
                  <p className="text-glitch-green/60 font-mono">
                    {filter === 'all' ? '暂无可用任务' : `暂无${filterOptions.find((f) => f.key === filter)?.label}任务`}
                  </p>
                  <p className="text-glitch-green/40 text-sm font-mono mt-2">
                    继续游戏以解锁更多分支任务
                  </p>
                </div>
              )}

              <div className="mt-6 pt-4 border-t border-glitch-green/20">
                <div className="text-xs text-glitch-green/40 font-mono">
                  <div>总计: {tasks.length} 个任务</div>
                  <div>待处理: {tasks.filter((t) => t.status === 'pending').length} 个</div>
                  <div>进行中: {tasks.filter((t) => t.status === 'accepted' || t.status === 'in_progress').length} 个</div>
                  <div>已完成: {tasks.filter((t) => t.status === 'completed').length} 个</div>
                </div>
              </div>
            </div>
          </TerminalWindow>
        </div>
      </div>
    </div>
  );
}
