import { useTitle } from '../hooks/common/useTitle';

import RequireAuth from '../components/RequireAuth';
import SettingTemplate from './templates/SettingTemplate';

const SettingsPage = () => {
  useTitle('설정 - PromiseNow');

  return (
    <RequireAuth>
      <SettingTemplate />
    </RequireAuth>
  );
};

export default SettingsPage;
