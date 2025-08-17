// src/features/chat/components/ChatScreen.tsx
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';

import type { ChatMessageResponse } from '../../../apis/chat/chat.types';
import { chatKeys } from '../../../hooks/chat';
import { useChatMessages } from '../../../hooks/chat/queries';
import { useChatSocket } from '../../../hooks/socket/useChatSocket';

import { useRoomUserInfo } from '../../../hooks/queries/room';
import { useUserStore } from '../../../stores/user.store'; // ★ 추가
import MessageList from './MessageList';
import PinoExample from './PinoExample';
import Transmits from './Transmits';

const ChatScreen = () => {
  const { id } = useParams<{ id: string }>();
  const roomId = Number(id);

  // ★ room store 제거 → 현재 로그인 사용자만 사용
  const userId = useUserStore((s) => s.user?.userId);

  // ★ 방-사용자 매핑 정보 조회(멤버십 확인 등 필요 시 활용 가능)
  const { data: roomUserInfo } = useRoomUserInfo(roomId, userId ?? 0);

  const { data: messages = [], isLoading, isError } = useChatMessages(roomId);
  


  const qc = useQueryClient();
  const handleIncoming = useCallback(
    (raw: unknown) => {
      const msg = raw as ChatMessageResponse;

      
      qc.setQueryData<ChatMessageResponse[]>(chatKeys.messages(roomId), (old = []) => {
        const newMessages = [...old, msg];
        // 시간순으로 정렬 (sentDate 기준, 시간대 고려)
        const sortedMessages = newMessages.sort((a, b) => {
          try {
                         const getDateFromSentDate = (sentDate: string) => {
               return new Date(sentDate).getTime();
             };
            
            const dateA = getDateFromSentDate(a.sentDate);
            const dateB = getDateFromSentDate(b.sentDate);
            return dateA - dateB; // 오름차순 (최근 메시지가 아래로)
          } catch (error) {
            console.error('메시지 정렬 에러:', error, 'a:', a.sentDate, 'b:', b.sentDate);
            return 0;
          }
        });
        

        return sortedMessages;
      });
    },
    [qc, roomId],
  );

  const subscribeDest = useCallback((rid: number) => `/topic/chat/${rid}`, []);
  const { isConnected, sendMessage } = useChatSocket(roomId, handleIncoming, {
    subscribeDest,
  });



  const scrollerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    const c = scrollerRef.current;
    if (!c) return;
    requestAnimationFrame(() => {
      c.scrollTop = c.scrollHeight;
      setTimeout(() => {
        c.scrollTop = c.scrollHeight;
      }, 0);
    });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages.length, scrollToBottom]);

  const handleMediaLoad = useCallback(() => {
    scrollToBottom();
  }, [scrollToBottom]);

  if (Number.isNaN(roomId)) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-red-500">
        잘못된 채팅방입니다.
      </div>
    );
  }

  // 방 멤버가 아닐 때 막고 싶움
  if (userId && !roomUserInfo?.roomUserId) {
    return <div className="flex items-center justify-center h-full text-sm text-red-500">채팅방 접근 권한이 없습니다.</div>;
  }

  return (
    <div className="flex h-full flex-col pb-3">
      <div ref={scrollerRef} className="flex-1 overflow-y-auto px-4 pt-2 flex flex-col">
        {isLoading && <p className="text-center text-sm text-gray-500">로딩 중...</p>}
        {isError && <p className="text-center text-sm text-red-500">메시지 로드 실패</p>}
        {!isLoading && !isError && <MessageList messages={messages} onMediaLoad={handleMediaLoad} />}
      </div>

      <div className="px-4 pt-2">
        <div className="rounded-2xl bg-white p-1">
          <Transmits roomId={roomId} isConnected={isConnected} sendMessage={sendMessage} />
        </div>
        <div>
          <PinoExample />
        </div>
      </div>
    </div>
  );
};

export default ChatScreen;
