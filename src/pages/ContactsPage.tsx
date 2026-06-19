import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { ContactCard } from '../components/ContactCard';
import { CommunicationHUD } from '../components/CommunicationHUD';
import { TerminalWindow } from '../components/TerminalWindow';
import { GlitchText } from '../components/GlitchText';
import { ArrowLeft, Users, Search } from 'lucide-react';
import { useState } from 'react';

export function ContactsPage() {
  const navigate = useNavigate();
  const { getContacts, storyPackage, getConversationByContactId } = useGameStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const contacts = getContacts();

  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch = contact.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || contact.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleContactClick = (contactId: string) => {
    const conversation = getConversationByContactId(contactId);
    if (conversation) {
      navigate(`/chat/${conversation.id}`);
    } else {
      navigate(`/chat/new/${contactId}`);
    }
  };

  const handleCallClick = (contactId: string) => {
    navigate(`/calls?call=${contactId}`);
  };

  const handleMessageClick = (contactId: string) => {
    const conversation = getConversationByContactId(contactId);
    if (conversation) {
      navigate(`/chat/${conversation.id}`);
    } else {
      navigate(`/chat/new/${contactId}`);
    }
  };

  if (!storyPackage) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen w-full flex flex-col">
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
              <Users className="w-6 h-6 text-glitch-green" />
              <GlitchText
                text="CONTACTS://通讯簿"
                intensity={1}
                className="font-display text-xl text-glitch-green text-shadow-glow-green"
              />
            </div>
          </div>
          <CommunicationHUD showLabels={false} />
        </div>
      </div>

      <div className="flex-1 w-full p-4 sm:p-8">
        <div className="max-w-4xl mx-auto">
          <TerminalWindow title="directory.sys" className="w-full">
            <div className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-glitch-green/50" />
                  <input
                    type="text"
                    placeholder="搜索联系人..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-glitch-dark border border-glitch-green/30 text-glitch-green font-mono focus:border-glitch-green focus:outline-none focus:ring-1 focus:ring-glitch-green/50"
                  />
                </div>
                <div className="flex gap-2">
                  {['all', 'online', 'offline', 'busy', 'away'].map((status) => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={`px-3 py-2 text-sm font-mono border transition-all ${
                        statusFilter === status
                          ? 'border-glitch-green bg-glitch-green/20 text-glitch-green'
                          : 'border-glitch-green/30 text-glitch-green/60 hover:border-glitch-green/60'
                      }`}
                    >
                      {status === 'all' ? '全部' : status === 'online' ? '在线' : status === 'offline' ? '离线' : status === 'busy' ? '忙碌' : '离开'}
                    </button>
                  ))}
                </div>
              </div>

              {filteredContacts.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {filteredContacts.map((contact) => (
                    <ContactCard
                      key={contact.id}
                      contact={contact}
                      onClick={() => handleContactClick(contact.id)}
                      onCallClick={() => handleCallClick(contact.id)}
                      onMessageClick={() => handleMessageClick(contact.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-glitch-green/30 mx-auto mb-4" />
                  <p className="text-glitch-green/60 font-mono">
                    {searchQuery ? '未找到匹配的联系人' : '暂无可用联系人'}
                  </p>
                  <p className="text-glitch-green/40 text-sm font-mono mt-2">
                    继续游戏以解锁更多联系人
                  </p>
                </div>
              )}

              <div className="mt-6 pt-4 border-t border-glitch-green/20">
                <div className="text-xs text-glitch-green/40 font-mono">
                  <div>总计: {contacts.length} 个联系人</div>
                  <div>在线: {contacts.filter((c) => c.status === 'online').length} 人</div>
                </div>
              </div>
            </div>
          </TerminalWindow>
        </div>
      </div>
    </div>
  );
}
