import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';

import type { IMessage } from '@stomp/stompjs';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

import type { ChatMessage } from '../../../apis/chat/chat.type';
import { getChatMessages } from './../../../apis/chat/chat.api';

// import { dummyMessages } from '../dummy';
import MessageList from './MessageList';
import Transmits from './Transmits';

// 수신 메시지 형식 (서버에서 push됨)

const ChatScreen = () => {
  const { id } = useParams<{ id: string }>();
  const parsedRoomId = parseInt(id || '', 10);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const clientRef = useRef<Client | null>(null);

  // 1️⃣ 과거 메시지 조회 (REST API)
  useEffect(() => {
    if (isNaN(parsedRoomId)) return;

    const fetchMessages = async () => {
      try {
        const data = await getChatMessages(parsedRoomId);
        setMessages(data ?? []);
      } catch (error) {
        console.error('❌ 메시지 로딩 에러:', error);
      }
      // setMessages(dummyMessages);
    };

    fetchMessages();
  }, [parsedRoomId]);

  // 2️⃣ WebSocket 연결 및 구독
  useEffect(() => {
    if (isNaN(parsedRoomId)) return;

    const socket = new SockJS('http://localhost:8080/ws-chat'); // ✅ 백엔드 설정: WebSocketConfig
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      onConnect: () => {
        console.log('🟢 WebSocket 연결 성공');

        // ✅ 구독: /topic/chat/{id}
        client.subscribe(`/topic/chat/${parsedRoomId}`, (message: IMessage) => {
          const payload: ChatMessage = JSON.parse(message.body);
          setMessages((prev) => [...prev, payload]);
        });
      },
      onStompError: (frame) => {
        console.error('❌ STOMP 에러:', frame);
      },
    });

    client.activate();
    clientRef.current = client;

    // 언마운트 시 연결 해제
    return () => {
      console.log('🔴 WebSocket 연결 해제');
      client.deactivate();
    };
  }, [parsedRoomId]);

  return (
    <div className="relative h-full">
      {/* 메시지 표시 영역 */}
      <div className="overflow-y-auto h-full pb-[130px] px-4 pt-2">
        <MessageList messages={messages} myUserId={9007199254740991} />
      </div>

      {/* 메시지 전송 영역 */}
      <div className="fixed bottom-[70px] left-1/2 -translate-x-1/2 w-full max-w-mobile px-4 z-20">
        <Transmits roomId={parsedRoomId} stompClient={clientRef.current} />
      </div>
    </div>
  );
};

export default ChatScreen;
