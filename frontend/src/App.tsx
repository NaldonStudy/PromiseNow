import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { useKakaoLoader } from './hooks/kakao/useKakaoLoader';
import { useUserStore } from './stores/user.store';
import { useEffect } from 'react';

import CallPage from './pages/CallPage';
import ChatPage from './pages/ChatPage';
import HomePage from './pages/HomePage';
import LandingPage from './pages/LandingPage';
import RoulettePage from './pages/RoulettePage';
import SchedulePage from './pages/SchedulePage';
import SettingsPage from './pages/SettingsPage';
import NotFoundPage from './pages/NotFoundPage';


function App() {
  useKakaoLoader();
  const { syncAuthState } = useUserStore();

  // 앱 시작 시 쿠키와 store 상태 동기화
  useEffect(() => {
    syncAuthState();
  }, [syncAuthState]);

  return (
    <div className="flex justify-center bg-gray-100">
      <div className="w-full max-w-mobile min-h-screen bg-white shadow-lg">
        <QueryClientProvider client={new QueryClient()}>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/home" element={<HomePage />} />
              <Route path="/:id/roulette" element={<RoulettePage />} />
              <Route path="/:id/schedule" element={<SchedulePage />} />
              <Route path="/:id/call" element={<CallPage />} />
              <Route path="/:id/chat" element={<ChatPage />} />
              <Route path="/:id/settings" element={<SettingsPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </BrowserRouter>
        </QueryClientProvider>
      </div>
    </div>
  );
}

export default App;
