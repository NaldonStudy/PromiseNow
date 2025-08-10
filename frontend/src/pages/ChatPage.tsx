import { useTitle } from '../hooks/common/useTitle';

import RequireAuth from '../components/RequireAuth';
import ChatTemplate from './templates/ChatTemplate';

const ChatPage = () => {
  useTitle('채팅 - PromiseNow');

  return (
    <RequireAuth>
      <ChatTemplate />
    </RequireAuth>
  );
};

export default ChatPage;
