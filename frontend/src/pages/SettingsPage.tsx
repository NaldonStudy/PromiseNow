import { useTitle } from '../hooks/common/useTitle';

import SettingTemplate from './templates/SettingTemplate';

const SettingsPage = () => {
  useTitle('설정 - PromiseNow');

  return <SettingTemplate />;
};

export default SettingsPage;
