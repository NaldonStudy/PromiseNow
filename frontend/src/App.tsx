import { BrowserRouter, Route, Routes } from 'react-router-dom';

import CallPage from './pages/CallPage';
import RendingPage from './pages/RendingPage';
import HomePage from './pages/HomePage';
import LocationPage from './pages/LocationPage';
import RoulettePage from './pages/RoulettePage';
import SchedulePage from './pages/SchedulePage';
import SettingsPage from './pages/SettingsPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RendingPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/:id/roulette" element={<RoulettePage />} />
        <Route path="/:id/schedule" element={<SchedulePage />} />
        <Route path="/:id/call" element={<CallPage />} />
        <Route path="/:id/location" element={<LocationPage />} />
        <Route path="/:id/settings" element={<SettingsPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
