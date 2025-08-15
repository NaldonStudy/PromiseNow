import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { useKakaoLoader } from './hooks/kakao/useKakaoLoader';

import CallPage from './pages/CallPage';
import ChatPage from './pages/ChatPage';
import HomePage from './pages/HomePage';
import LocationPage from './pages/LocationPage';
import LandingPage from './pages/LandingPage';
import RoulettePage from './pages/RoulettePage';
import SchedulePage from './pages/SchedulePage';
import SettingsPage from './pages/SettingsPage';
import NotFoundPage from './pages/NotFoundPage';
import CallLayout from './features/callScreen/CallLayout';

function App() {
  useKakaoLoader();

  return (
    <div className="flex justify-center bg-gray-100">
      <div className="w-full max-w-mobile min-h-screen bg-white shadow-lg">
        <QueryClientProvider client={new QueryClient()}>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/home" element={<HomePage />} />
              <Route path="/:id" element={<CallLayout />}>
                <Route path="roulette" element={<RoulettePage />} />
                <Route path="schedule" element={<SchedulePage />} />
                <Route path="call" element={<CallPage />} />
                <Route path="chat" element={<ChatPage />} />
                <Route path="location" element={<LocationPage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </BrowserRouter>
        </QueryClientProvider>
      </div>
    </div>
  );
}

export default App;
