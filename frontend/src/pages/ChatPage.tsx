import { useTitle } from '../hooks/common/useTitle';

import ChatTemplate from './templates/ChatTemplate';

const ChatPage = () => {
  useTitle('채팅 - PromiseNow');

  return <ChatTemplate />;
};

export default ChatPage;
