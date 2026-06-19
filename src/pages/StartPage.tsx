import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Terminal, Play, BookOpen, Trophy } from 'lucide-react';
import { GlitchText } from '../components/GlitchText';
import { TerminalWindow } from '../components/TerminalWindow';
import { useGameStore } from '../store/gameStore';
import { sampleStory } from '../data/sampleStory';
import { hasSave } from '../utils/storage';

export function StartPage() {
  const navigate = useNavigate();
  const { setStoryPackage, startNewGame, continueGame } = useGameStore();
  const [canContinue, setCanContinue] = useState(false);
  const [showTitle, setShowTitle] = useState(false);

  useEffect(() => {
    setStoryPackage(sampleStory);
    setCanContinue(hasSave());
    const timer = setTimeout(() => setShowTitle(true), 200);
    return () => clearTimeout(timer);
  }, [setStoryPackage]);

  const handleNewGame = () => {
    startNewGame();
    navigate('/game');
  };

  const handleContinue = () => {
    if (continueGame()) {
      navigate('/game');
    }
  };

  const handleEndings = () => {
    navigate('/endings');
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-8">
      <TerminalWindow
        title="root@glitch-adventure:~/"
        className="max-w-2xl"
      >
        <div className="p-6 sm:p-10 flex flex-col items-center gap-8">
          <div
            className={`transition-all duration-700 ${
              showTitle ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
            }`}
          >
            <div className="text-center">
              <GlitchText
                text="GLITCH://"
                intensity={2}
                className="font-display text-4xl sm:text-6xl text-glitch-green text-shadow-glow-green"
                charGlitch={false}
              />
              <GlitchText
                text="神经网络协议"
                intensity={1.5}
                className="font-display text-2xl sm:text-4xl text-glitch-magenta text-shadow-glow-red block mt-2"
                charGlitch={false}
              />
            </div>
            <p className="text-center text-glitch-blue/70 text-sm sm:text-base mt-6 font-mono text-shadow-glow-blue">
              {'>'} 2087年 / 赛博空间 / 神经接口已就绪
            </p>
          </div>

          <div className="text-glitch-green/60 text-sm font-mono max-w-md text-center leading-relaxed">
            你是一名地下神经黑客。一次普通的任务，揭开了一个被掩埋三年的秘密。
            你的妹妹——她还活着，以数据的形式...
          </div>

          <div className="flex flex-col gap-3 w-full max-w-sm mt-4">
            <button
              onClick={handleNewGame}
              className="glitch-btn flex items-center justify-center gap-3 !py-4"
            >
              <Play className="w-5 h-5" />
              <span>开始新游戏</span>
            </button>

            {canContinue && (
              <button
                onClick={handleContinue}
                className="glitch-btn !border-glitch-blue !text-glitch-blue hover:!bg-glitch-blue flex items-center justify-center gap-3 !py-3"
                style={{ borderColor: '#00d4ff', color: '#00d4ff' }}
              >
                <Terminal className="w-5 h-5" />
                <span>继续游戏</span>
              </button>
            )}

            <button
              onClick={handleEndings}
              className="glitch-btn !border-glitch-yellow !text-glitch-yellow hover:!bg-glitch-yellow flex items-center justify-center gap-3 !py-3"
              style={{ borderColor: '#ffff00', color: '#ffff00' }}
            >
              <Trophy className="w-5 h-5" />
              <span>结局图鉴</span>
            </button>
          </div>

          <div className="text-xs text-glitch-green/40 font-mono mt-4 flex items-center gap-2">
            <BookOpen className="w-3 h-3" />
            <span>提示：点击文字可跳过打字动画 | 输入关键词解锁隐藏剧情</span>
          </div>
        </div>
      </TerminalWindow>
    </div>
  );
}
