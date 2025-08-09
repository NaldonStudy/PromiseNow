// src/features/chat/components/ChatScreen.tsx
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';

import type { ChatMessageResponse } from '../../../apis/chat/chat.types';
import { chatKeys } from '../../../hooks/chat';
import { useChatMessages } from '../../../hooks/chat/queries';
import { useChatSocket } from '../../../hooks/socket/useChatSocket';

import { useRoomStore } from '../../../stores/room.store';
import MessageList from './MessageList';
import PinoExample from './PinoExample';
import Transmits from './Transmits';

const ChatScreen = () => {
  const { id } = useParams<{ id: string }>();
  const roomId = Number(id);

  const setCurrentRoomId = useRoomStore((s) => s.setCurrentRoomId);
  useEffect(() => {
    if (!Number.isNaN(roomId)) setCurrentRoomId(roomId);
    return () => setCurrentRoomId(null);
  }, [roomId, setCurrentRoomId]);

  const { data: messages = [], isLoading, isError } = useChatMessages(roomId);

  const qc = useQueryClient();
  const handleIncoming = useCallback(
    (raw: unknown) => {
      const msg = raw as ChatMessageResponse;
      qc.setQueryData<ChatMessageResponse[]>(chatKeys.messages(roomId), (old = []) => [
        ...old,
        msg,
      ]);
    },
    [qc, roomId],
  );

  const wsBase = useMemo(() => 'https://api.promisenow.store/ws-chat', []);
  const subscribeDest = useCallback((rid: number) => `/topic/chat/${rid}`, []);

  const { isConnected, sendMessage } = useChatSocket(roomId, handleIncoming, {
    wsBase,
    subscribeDest,
  });

  if (Number.isNaN(roomId)) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-red-500">
        잘못된 채팅방입니다.
      </div>
    );
  }

  return (
    <div className="relative h-full">
      <div className="overflow-y-auto h-full pb-[180px] px-4 pt-2">
        {isLoading && <p className="text-center text-sm text-gray-500">로딩 중...</p>}
        {isError && <p className="text-center text-sm text-red-500">메시지 로드 실패</p>}
        {!isLoading && !isError && <MessageList messages={messages} />}
      </div>

      <div className="fixed bottom-[80px] left-1/2 -translate-x-1/2 w-full max-w-mobile px-4">
        <div className="flex flex-col gap-2">
          <Transmits roomId={roomId} isConnected={isConnected} sendMessage={sendMessage} />
          <PinoExample />
        </div>
      </div>
    </div>
  );
};

export default ChatScreen;
