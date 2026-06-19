import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { StartPage } from './pages/StartPage';
import { GamePage } from './pages/GamePage';
import { EndingsPage } from './pages/EndingsPage';
import { StorySelectPage } from './pages/StorySelectPage';
import { Scanlines } from './components/Scanlines';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen w-full bg-glitch-bg text-glitch-green">
        <div className="noise-overlay" />
        <Scanlines />
        <div className="relative z-10">
          <Routes>
            <Route path="/" element={<StartPage />} />
            <Route path="/stories" element={<StorySelectPage />} />
            <Route path="/game" element={<GamePage />} />
            <Route path="/endings" element={<EndingsPage />} />
            <Route path="*" element={<StartPage />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
