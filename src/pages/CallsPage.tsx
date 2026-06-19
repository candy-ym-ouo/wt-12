import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { IncomingCallOverlay } from '../components/IncomingCallOverlay';
import { CommunicationHUD } from '../components/CommunicationHUD';
import { TerminalWindow } from '../components/TerminalWindow';
import { GlitchText } from '../components/GlitchText';
import { ArrowLeft, Phone, PhoneOff, PhoneIncoming, PhoneMissed, Clock } from 'lucide-react';

export function CallsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const callContactId = searchParams.get('call');

  const {
    storyPackage,
    activeCall,
    pendingCalls,
    answerCall,
    rejectCall,
    endCall,
    getContactById,
    getPendingCalls,
    answeredCalls,
    rejectedCalls,
    triggerIncomingCall,
  } = useGameStore();

  const [filter, setFilter] = useState<'all' | 'incoming' | 'answered' | 'missed'>('all');

  useEffect(() => {
    if (callContactId && !activeCall) {
      const callId = `call_manual_${callContactId}_${Date.now()}`;
      triggerIncomingCall(callId);
    }
  }, [callContactId, activeCall, triggerIncomingCall]);

  const handleAnswer = () => {
    if (activeCall) {
      answerCall(activeCall.id);
    }
  };

  const handleReject = () => {
    if (activeCall) {
      rejectCall(activeCall.id);
    }
  };

  const formatTime = (timestamp?: number) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!storyPackage) {
    navigate('/');
    return null;
  }

  const caller = activeCall ? getContactById(activeCall.callerId) : null;

  const allCalls = [
    ...getPendingCalls().map((c) => ({
      ...c,
      type: 'incoming' as const,
      contact: getContactById(c.callerId),
    })),
    ...Array.from(answeredCalls).map((id) => ({
      id,
      callerId: id,
      type: 'answered' as const,
      contact: getContactById(id),
      startTime: Date.now() - Math.random() * 86400000,
      duration: Math.floor(Math.random() * 300) + 30,
    })),
    ...Array.from(rejectedCalls).map((id) => ({
      id,
      callerId: id,
      type: 'missed' as const,
      contact: getContactById(id),
      startTime: Date.now() - Math.random() * 86400000,
      duration: 0,
    })),
  ].filter((c) => c.contact);

  const filteredCalls = allCalls.filter((c) => {
    if (filter === 'all') return true;
    return c.type === filter;
  });

  return (
    <div className="min-h-screen w-full flex flex-col">
      {activeCall && (
        <IncomingCallOverlay
          call={activeCall}
          contact={caller}
          onAnswer={handleAnswer}
          onReject={handleReject}
        />
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
              <Phone className="w-6 h-6 text-glitch-yellow" />
              <GlitchText
                text="CALLS://通话记录"
                intensity={1}
                className="font-display text-xl text-glitch-yellow text-shadow-glow-yellow"
              />
            </div>
          </div>
          <CommunicationHUD showLabels={false} />
        </div>
      </div>

      <div className="flex-1 w-full p-4 sm:p-8">
        <div className="max-w-4xl mx-auto">
          <TerminalWindow title="call_log.sys" className="w-full">
            <div className="p-4 sm:p-6">
              <div className="flex gap-2 mb-6 overflow-x-auto">
                {[
                  { key: 'all', label: '全部', icon: Clock },
                  { key: 'incoming', label: '来电', icon: PhoneIncoming },
                  { key: 'answered', label: '已接', icon: Phone },
                  { key: 'missed', label: '未接', icon: PhoneMissed },
                ].map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setFilter(key as typeof filter)}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-mono border transition-all whitespace-nowrap ${
                      filter === key
                        ? 'border-glitch-yellow bg-glitch-yellow/20 text-glitch-yellow'
                        : 'border-glitch-green/30 text-glitch-green/60 hover:border-glitch-yellow/60'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                ))}
              </div>

              {filteredCalls.length > 0 ? (
                <div className="space-y-2">
                  {filteredCalls.map((call) => {
                    const ContactIcon =
                      call.type === 'answered'
                        ? Phone
                        : call.type === 'missed'
                        ? PhoneMissed
                        : PhoneIncoming;
                    const iconColor =
                      call.type === 'answered'
                        ? 'text-glitch-green'
                        : call.type === 'missed'
                        ? 'text-glitch-red'
                        : 'text-glitch-yellow';

                    return (
                      <div
                        key={call.id}
                        className="flex items-center justify-between p-4 bg-glitch-dark/50 border border-glitch-green/20 hover:border-glitch-green/40 transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`${iconColor}`}>
                            <ContactIcon className="w-6 h-6" />
                          </div>
                          <div>
                            <div className="font-display text-lg text-glitch-green">
                              {call.contact?.name ?? '未知号码'}
                            </div>
                            <div className="text-xs text-glitch-green/40 font-mono">
                              {call.type === 'answered'
                                ? '已接听'
                                : call.type === 'missed'
                                ? '未接听'
                                : '来电中'}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-sm text-glitch-green/60 font-mono">
                              {formatTime(call.startTime)}
                            </div>
                            {call.duration && (
                              <div className="text-xs text-glitch-green/40 font-mono">
                                时长: {Math.floor(call.duration / 60)}:{String(call.duration % 60).padStart(2, '0')}
                              </div>
                            )}
                          </div>
                          {call.contact && call.type !== 'incoming' && (
                            <button
                              onClick={() => navigate(`/calls?call=${call.contact.id}`)}
                              className="glitch-btn !py-2 !px-3"
                            >
                              <Phone className="w-4 h-4" />
                            </button>
                          )}
                          {call.type === 'incoming' && (
                            <div className="flex gap-2">
                              <button
                                onClick={handleReject}
                                className="glitch-btn !py-2 !px-3 !border-glitch-red/50 !text-glitch-red hover:!bg-glitch-red/20"
                              >
                                <PhoneOff className="w-4 h-4" />
                              </button>
                              <button
                                onClick={handleAnswer}
                                className="glitch-btn !py-2 !px-3 !border-glitch-green/50 !text-glitch-green hover:!bg-glitch-green/20"
                              >
                                <Phone className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Phone className="w-16 h-16 text-glitch-yellow/30 mx-auto mb-4" />
                  <p className="text-glitch-green/60 font-mono">暂无通话记录</p>
                  <p className="text-glitch-green/40 text-sm font-mono mt-2">
                    继续游戏以触发剧情来电
                  </p>
                </div>
              )}

              <div className="mt-6 pt-4 border-t border-glitch-green/20">
                <div className="text-xs text-glitch-green/40 font-mono">
                  <div>总计: {allCalls.length} 条通话</div>
                  <div>已接听: {allCalls.filter((c) => c.type === 'answered').length} 次</div>
                  <div>未接听: {allCalls.filter((c) => c.type === 'missed').length} 次</div>
                </div>
              </div>
            </div>
          </TerminalWindow>
        </div>
      </div>
    </div>
  );
}
