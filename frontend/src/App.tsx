import { BrowserRouter, Route, Routes } from 'react-router-dom';

import HomePage from './pages/HomePage';
import RoulettePage from './pages/RoulettePage';
import SchedulePage from './pages/SchedulePage';
import CallPage from './pages/CallPage';
import LocationPage from './pages/LocationPage';
import SettingsPage from './pages/SettingsPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
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
