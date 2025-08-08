// src/features/chat/components/ChatScreen.tsx
import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { useParams } from 'react-router-dom';
import type { ChatMessageResponse } from '../../../apis/chat/chat.types';
import { chatKeys } from '../../../hooks/chat';
import { useChatMessages } from './../../../hooks/chat/queries';

import { useChatSocket } from '../../../hooks/socket/useChatSocket';

import MessageList from './MessageList';
import PinoExample from './PinoExample';
import Transmits from './Transmits';

const ChatScreen = () => {
  const { id } = useParams<{ id: string }>();
  const roomId = Number(id);

  const { data: messages = [], isLoading, isError } = useChatMessages(roomId);

  // 2) WS 수신 시, React Query 캐시에 바로 append
  const queryClient = useQueryClient();
  const handleIncoming = useCallback(
    (raw: unknown) => {
      // 서버 푸시 스키마에 맞춰 타입 단언
      const msg = raw as ChatMessageResponse;

      // 최신 목록 뒤에 붙이기
      queryClient.setQueryData<ChatMessageResponse[]>(chatKeys.messages(roomId), (old = []) => [
        ...old,
        msg,
      ]);
    },
    [queryClient, roomId],
  );

  // 3) WebSocket 연결/구독
  //    - wsBase: 서버 SockJS 엔드포인트
  //    - subscribeDest: 서버가 push하는 주제(topic)
  const { client /*, isConnected*/ } = useChatSocket(roomId, handleIncoming, {
    wsBase: 'http://localhost:8080/ws-chat',
    subscribeDest: (rid) => `/topic/chat/${rid}`,
  });

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
          <Transmits roomId={roomId} stompClient={client} />
          <PinoExample />
        </div>
      </div>
    </div>
  );
};

export default ChatScreen;
