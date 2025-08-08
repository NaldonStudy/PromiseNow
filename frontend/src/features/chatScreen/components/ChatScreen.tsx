// src/features/chat/components/ChatScreen.tsx
import { useParams } from 'react-router-dom';
import { useChatMessages } from './../../../hooks/chat/queries';

import MessageList from './MessageList';
import PinoExample from './PinoExample';
import Transmits from './Transmits';

const ChatScreen = () => {
  const { id } = useParams<{ id: string }>();
  const roomId = Number(id);

  const { data: messages = [], isLoading, isError } = useChatMessages(roomId);

  return (
    <div className="relative h-full">
      <div className="overflow-y-auto h-full pb-[180px] px-4 pt-2">
        {isLoading && <p className="text-center text-sm text-gray-500">로딩 중...</p>}
        {isError && <p className="text-center text-sm text-red-500">메시지 로드 실패</p>}
        {!isLoading && !isError && <MessageList messages={messages} />}
      </div>

      <div className="fixed bottom-[80px] left-1/2 -translate-x-1/2 w-full max-w-mobile px-4">
        <div className="flex flex-col gap-2">
          {/* WS 전송은 나중에 붙일 예정이므로 일단 REST 파트만 남김 */}
          <Transmits roomId={roomId} />
          <PinoExample />
        </div>
      </div>
    </div>
  );
};

export default ChatScreen;
