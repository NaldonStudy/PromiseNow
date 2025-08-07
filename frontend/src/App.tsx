import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { useKakaoLoader } from './hooks/kakao/useKakaoLoader';

import CallPage from './pages/CallPage';
import ChatPage from './pages/ChatPage';
import HomePage from './pages/HomePage';
import LocationPage from './pages/LocationPage';
import RandingPage from './pages/RandingPage';
import RoulettePage from './pages/RoulettePage';
import SchedulePage from './pages/SchedulePage';
import SettingsPage from './pages/SettingsPage';
import ChatPage from './pages/ChatPage';
import LeaderPage from './pages/LeaderPage';

function App() {
  useKakaoLoader();

  return (
    <div className="flex justify-center bg-gray-100">
      <div className="w-full max-w-mobile min-h-screen bg-white shadow-lg">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<RandingPage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/:id/roulette" element={<RoulettePage />} />
            <Route path="/:id/schedule" element={<SchedulePage />} />
            <Route path="/:id/call" element={<CallPage />} />
            <Route path="/:id/location" element={<LocationPage />} />
            <Route path="/:id/settings" element={<SettingsPage />} />
            <Route path="/:id/chat" element={<ChatPage />} />
            <Route path="/:id/leaderboard" element={<LeaderPage />} />
          </Routes>
        </BrowserRouter>
      </div>
    </div>
  );
}

export default App;
