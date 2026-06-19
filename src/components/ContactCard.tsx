import type { Contact } from '../data/types';
import { useGameStore } from '../store/gameStore';
import { Phone, MessageCircle, User, Wifi, WifiOff, Minus, EyeOff } from 'lucide-react';

interface ContactCardProps {
  contact: Contact;
  onClick?: () => void;
  showCallButton?: boolean;
  showMessageButton?: boolean;
  onCallClick?: () => void;
  onMessageClick?: () => void;
}

const statusIcons = {
  online: Wifi,
  offline: WifiOff,
  busy: Minus,
  away: Minus,
  hidden: EyeOff,
};

const statusColors = {
  online: 'text-glitch-green',
  offline: 'text-gray-500',
  busy: 'text-glitch-red',
  away: 'text-glitch-yellow',
  hidden: 'text-gray-600',
};

const statusLabels = {
  online: '在线',
  offline: '离线',
  busy: '忙碌',
  away: '离开',
  hidden: '隐身',
};

export function ContactCard({
  contact,
  onClick,
  showCallButton = true,
  showMessageButton = true,
  onCallClick,
  onMessageClick,
}: ContactCardProps) {
  const { getUnreadMessageCount, getConversationByContactId } = useGameStore();
  const conversation = getConversationByContactId(contact.id);
  const unreadCount = conversation?.unreadCount ?? 0;
  const faction = useGameStore
    .getState()
    .storyPackage?.factions?.find((f) => f.id === contact.factionId);

  const StatusIcon = statusIcons[contact.status];
  const statusColor = statusColors[contact.status];
  const statusLabel = statusLabels[contact.status];

  return (
    <div
      className={`relative bg-glitch-bg border border-glitch-green/30 p-4 rounded-sm hover:border-glitch-green/60 transition-all duration-200 cursor-pointer group ${
        unreadCount > 0 ? 'animate-pulse-slow' : ''
      }`}
      onClick={onClick}
    >
      {unreadCount > 0 && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-glitch-red rounded-full flex items-center justify-center text-xs font-bold text-white animate-bounce">
          {unreadCount}
        </div>
      )}
      <div className="flex items-start gap-4">
        <div className="relative">
          <div className="w-12 h-12 bg-glitch-dark rounded-full flex items-center justify-center border-2 border-glitch-green/50">
            {contact.avatar ? (
              <img
                src={contact.avatar}
                alt={contact.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <User className="w-6 h-6 text-glitch-green" />
            )}
          </div>
          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-glitch-bg flex items-center justify-center ${statusColor}`}>
            <StatusIcon className="w-3 h-3" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-display text-lg text-glitch-green truncate group-hover:text-shadow-glow-green transition-all">
              {contact.name}
            </h3>
            {faction && (
              <span
                className="text-xs px-2 py-0.5 border"
                style={{
                  borderColor: faction.color,
                  color: faction.color,
                  textShadow: `0 0 8px ${faction.color}40`,
                }}
              >
                {faction.shortName ?? faction.name}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-xs ${statusColor}`}>● {statusLabel}</span>
            {contact.lastSeen && contact.status === 'offline' && (
              <span className="text-xs text-gray-500">
                最后在线: {new Date(contact.lastSeen).toLocaleString('zh-CN', {
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            )}
          </div>
          {contact.statusMessage && (
            <p className="text-sm text-glitch-green/60 mt-2 truncate font-mono">
              {contact.statusMessage}
            </p>
          )}
          {contact.description && (
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
              {contact.description}
            </p>
          )}
        </div>
      </div>

      {(showCallButton || showMessageButton) && (
        <div className="flex gap-2 mt-4 pt-4 border-t border-glitch-green/20">
          {showCallButton && contact.status === 'online' && (
            <button
              className="glitch-btn !py-2 !px-4 flex items-center gap-2 flex-1 text-sm"
              onClick={(e) => {
                e.stopPropagation();
                onCallClick?.();
              }}
            >
              <Phone className="w-4 h-4" />
              通话
            </button>
          )}
          {showMessageButton && (
            <button
              className="glitch-btn !py-2 !px-4 flex items-center gap-2 flex-1 text-sm"
              onClick={(e) => {
                e.stopPropagation();
                onMessageClick?.();
              }}
            >
              <MessageCircle className="w-4 h-4" />
              消息
            </button>
          )}
        </div>
      )}
    </div>
  );
}
