import { useEffect, useRef, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { MessageBubble } from '../components/MessageBubble';
import { CommunicationHUD } from '../components/CommunicationHUD';
import { TerminalWindow } from '../components/TerminalWindow';
import { GlitchText } from '../components/GlitchText';
import { ArrowLeft, Phone, MoreVertical, User } from 'lucide-react';
import { TextInput } from '../components/TextInput';
import type { Message, Conversation, Contact } from '../data/types';

export function ChatPage() {
  const navigate = useNavigate();
  const { conversationId, contactId } = useParams<{ conversationId: string; contactId: string }>();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const storyPackage = useGameStore((state) => state.storyPackage);
  const getConversationById = useGameStore((state) => state.getConversationById);
  const getConversationByContactId = useGameStore((state) => state.getConversationByContactId);
  const getOrCreateConversation = useGameStore((state) => state.getOrCreateConversation);
  const getContactById = useGameStore((state) => state.getContactById);
  const sendMessage = useGameStore((state) => state.sendMessage);
  const setCurrentConversation = useGameStore((state) => state.setCurrentConversation);
  const markConversationAsRead = useGameStore((state) => state.markConversationAsRead);

  const conversation = useMemo<Conversation | null>(() => {
    if (!storyPackage) return null;
    if (conversationId) {
      return getConversationById(conversationId);
    }
    if (contactId) {
      return getConversationByContactId(contactId);
    }
    return null;
  }, [storyPackage, conversationId, contactId, getConversationById, getConversationByContactId]);

  const contact = useMemo<Contact | null>(() => {
    if (!storyPackage) return null;
    if (conversation) {
      return getContactById(conversation.contactId);
    }
    if (contactId) {
      return getContactById(contactId);
    }
    return null;
  }, [storyPackage, conversation, contactId, getContactById]);

  useEffect(() => {
    if (!storyPackage) {
      navigate('/');
      return;
    }

    if (conversationId) {
      setCurrentConversation(conversationId);
      markConversationAsRead(conversationId);
    } else if (contactId && !conversation) {
      const conv = getOrCreateConversation(contactId);
      if (conv) {
        navigate(`/chat/${conv.id}`, { replace: true });
        return;
      }
    }

    return () => {
      setCurrentConversation(null);
    };
  }, [storyPackage, conversationId, contactId, conversation, setCurrentConversation, markConversationAsRead, getOrCreateConversation, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation?.messages?.length]);

  const handleSendMessage = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;

    if (conversation) {
      sendMessage(conversation.id, trimmed);
    } else if (contactId) {
      const conv = getOrCreateConversation(contactId);
      if (conv) {
        sendMessage(conv.id, trimmed);
        navigate(`/chat/${conv.id}`, { replace: true });
      }
    }
  };

  const getMessagesToShow = (): Message[] => {
    if (!conversation) return [];
    return conversation.messages;
  };

  const shouldShowSenderName = (index: number, messages: Message[]) => {
    if (index === 0) return true;
    return messages[index - 1].senderId !== messages[index].senderId;
  };

  if (!storyPackage) {
    return null;
  }

  if (!contact) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="text-center">
          <GlitchText
            text="ERROR://404"
            intensity={2}
            className="text-4xl text-glitch-red text-shadow-glow-red mb-4"
          />
          <p className="text-glitch-green/60 font-mono">联系人不存在</p>
          <button onClick={() => navigate('/contacts')} className="glitch-btn mt-4">
            返回联系人列表
          </button>
        </div>
      </div>
    );
  }

  const messages = getMessagesToShow();
  const windowTitle = conversation ? `chat://${conversation.id}` : `chat://new/${contactId}`;

  return (
    <div className="min-h-screen w-full flex flex-col">
      <div className="p-4 border-b border-glitch-green/30">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/contacts')}
              className="glitch-btn !py-2 !px-3 flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              返回
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-glitch-dark border-2 border-glitch-green/50 flex items-center justify-center">
                {contact.avatar ? (
                  <img src={contact.avatar} alt={contact.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <User className="w-5 h-5 text-glitch-green" />
                )}
              </div>
              <div>
                <GlitchText
                  text={contact.name}
                  intensity={0}
                  className="font-display text-lg text-glitch-green text-shadow-glow-green"
                />
                <div className="text-xs text-glitch-green/60 font-mono">
                  <span className={`inline-block w-2 h-2 rounded-full mr-1 ${
                    contact.status === 'online' ? 'bg-glitch-green' :
                    contact.status === 'busy' ? 'bg-glitch-red' :
                    contact.status === 'away' ? 'bg-glitch-yellow' : 'bg-gray-500'
                  }`} />
                  {contact.status === 'online' ? '在线' :
                   contact.status === 'busy' ? '忙碌' :
                   contact.status === 'away' ? '离开' : '离线'}
                  {contact.statusMessage && ` · ${contact.statusMessage}`}
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {contact.status === 'online' && (
              <button
                onClick={() => navigate(`/calls?call=${contact.id}`)}
                className="glitch-btn !py-2 !px-3 flex items-center gap-2"
              >
                <Phone className="w-4 h-4" />
              </button>
            )}
            <button className="glitch-btn !py-2 !px-3">
              <MoreVertical className="w-4 h-4" />
            </button>
            <CommunicationHUD showLabels={false} />
          </div>
        </div>
      </div>

      <div className="flex-1 w-full p-4 sm:p-8">
        <div className="max-w-4xl mx-auto h-full flex flex-col">
          <TerminalWindow title={windowTitle} className="w-full flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto p-4 min-h-[400px] max-h-[calc(100vh-300px)]">
              {messages.length > 0 ? (
                <div className="space-y-2">
                  {messages.map((message, index) => (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      senderName={contact.name}
                      isGrouped={!shouldShowSenderName(index, messages)}
                    />
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 rounded-full bg-glitch-dark border-2 border-glitch-green/30 flex items-center justify-center mb-4">
                    {contact.avatar ? (
                      <img src={contact.avatar} alt={contact.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <User className="w-10 h-10 text-glitch-green/50" />
                    )}
                  </div>
                  <p className="text-glitch-green/60 font-mono mb-2">
                    开始与 {contact.name} 的对话
                  </p>
                  <p className="text-glitch-green/40 text-sm font-mono">
                    发送第一条消息吧...
                  </p>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-glitch-green/20">
              <TextInput
                hint={`> 发送消息给 ${contact.name}...`}
                onSubmit={handleSendMessage}
                onTyping={() => {}}
                onError={() => {}}
              />
            </div>
          </TerminalWindow>
        </div>
      </div>
    </div>
  );
}
