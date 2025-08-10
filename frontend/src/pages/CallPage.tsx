import { useTitle } from '../hooks/common/useTitle';

import RequireAuth from '../components/RequireAuth';
import CallTemplate from './templates/CallTemplate';

const CallPage = () => {
  useTitle('통화 - PromiseNow');

  return (
    <RequireAuth>
      <CallTemplate />
    </RequireAuth>
  );
};

export default CallPage;
