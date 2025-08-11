import { useTitle } from '../hooks/common/useTitle';

import CallTemplate from './templates/CallTemplate';

const CallPage = () => {
  useTitle('통화 - PromiseNow');

  return <CallTemplate />;
};

export default CallPage;
