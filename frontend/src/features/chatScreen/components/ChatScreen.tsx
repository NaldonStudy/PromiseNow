import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';

import type { IMessage } from '@stomp/stompjs';
import { Client } from '@stomp/stompjs';

import type { ChatMessageResponse as ChatMessage } from '../../../apis/chat/chat.types';
import { getChatMessages } from './../../../apis/chat/chat.api';
import createWebSocketConnection from '../../../lib/websocketInstance';

// import { dummyMessages } from '../dummy';
import MessageList from './MessageList';
import PinoExample from './PinoExample';
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

    const socket = createWebSocketConnection('/ws-chat'); // ✅ 새로운 WebSocket 인스턴스 사용
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      onConnect: () => {
        console.log('🟢 Chat WebSocket 연결 성공');

        // ✅ 구독: /topic/chat/{id}
        client.subscribe(`/topic/chat/${parsedRoomId}`, (message: IMessage) => {
          const payload: ChatMessage = JSON.parse(message.body);
          setMessages((prev) => [...prev, payload]);
        });
      },
      onStompError: (frame) => {
        console.error('❌ Chat STOMP 에러:', frame);
      },
    });

    client.activate();
    clientRef.current = client;

    // 언마운트 시 연결 해제
    return () => {
      console.log('🔴 Chat WebSocket 연결 해제');
      client.deactivate();
    };
  }, [parsedRoomId]);

  return (
    <div className="relative h-full">
      {/* 메시지 표시 영역 */}
      <div className="overflow-y-auto h-full pb-[180px] px-4 pt-2">
        <MessageList messages={messages} />
      </div>

      {/* 메시지 전송 영역 */}
      <div className="fixed bottom-[80px] left-1/2 -translate-x-1/2 w-full max-w-mobile px-4">
        <div className="flex flex-col gap-2">
          <Transmits 
            roomId={parsedRoomId} 
            isConnected={!!clientRef.current?.connected}
            sendMessage={(body) => {
              if (clientRef.current?.connected) {
                clientRef.current.publish({
                  destination: '/app/chat/message',
                  body: JSON.stringify(body),
                });
              }
            }}
          />
          <PinoExample />
        </div>
      </div>
    </div>
  );
};

export default ChatScreen;
