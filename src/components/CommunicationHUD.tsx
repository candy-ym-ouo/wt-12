import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { MessageCircle, Phone, ClipboardList, Users, Bell } from 'lucide-react';

interface CommunicationHUDProps {
  showLabels?: boolean;
  vertical?: boolean;
}

export function CommunicationHUD({ showLabels = true, vertical = false }: CommunicationHUDProps) {
  const navigate = useNavigate();
  const {
    getUnreadMessageCount,
    pendingCalls,
    pendingTasks,
    pendingMessages,
    getContacts,
  } = useGameStore();

  const unreadCount = getUnreadMessageCount() + pendingMessages.length;
  const missedCalls = pendingCalls.length;
  const activeTasks = pendingTasks.length;
  const contactsCount = getContacts().length;

  const navItems = [
    {
      id: 'contacts',
      label: '联系人',
      icon: Users,
      count: contactsCount,
      path: '/contacts',
      color: 'text-glitch-green',
      borderColor: 'border-glitch-green',
      bgHover: 'hover:bg-glitch-green/20',
    },
    {
      id: 'messages',
      label: '消息',
      icon: MessageCircle,
      count: unreadCount,
      path: '/contacts',
      color: 'text-glitch-blue',
      borderColor: 'border-glitch-blue',
      bgHover: 'hover:bg-glitch-blue/20',
    },
    {
      id: 'calls',
      label: '通话',
      icon: Phone,
      count: missedCalls,
      path: '/calls',
      color: 'text-glitch-yellow',
      borderColor: 'border-glitch-yellow',
      bgHover: 'hover:bg-glitch-yellow/20',
    },
    {
      id: 'tasks',
      label: '任务',
      icon: ClipboardList,
      count: activeTasks,
      path: '/tasks',
      color: 'text-glitch-magenta',
      borderColor: 'border-glitch-magenta',
      bgHover: 'hover:bg-glitch-magenta/20',
    },
  ];

  const hasNotifications = unreadCount > 0 || missedCalls > 0 || activeTasks > 0;

  return (
    <div
      className={`flex ${
        vertical ? 'flex-col' : 'flex-row'
      } gap-2 p-2 bg-glitch-bg/80 backdrop-blur-sm border border-glitch-green/30 rounded-sm`}
    >
      {hasNotifications && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-glitch-red rounded-full flex items-center justify-center animate-pulse z-10">
          <Bell className="w-2 h-2 text-white" />
        </div>
      )}
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            onClick={() => navigate(item.path)}
            className={`relative flex items-center gap-2 px-3 py-2 border ${item.borderColor} ${item.color} ${item.bgHover} transition-all duration-200 rounded-sm ${
              vertical ? 'w-full justify-start' : ''
            }`}
          >
            <Icon className="w-5 h-5" />
            {showLabels && <span className="text-sm font-mono">{item.label}</span>}
            {item.count > 0 && (
              <div
                className={`absolute -top-2 -right-2 min-w-[20px] h-5 px-1 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                  item.id === 'tasks' ? 'bg-glitch-magenta' : item.id === 'calls' ? 'bg-glitch-yellow text-glitch-bg' : 'bg-glitch-red'
                }`}
              >
                {item.count > 99 ? '99+' : item.count}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
