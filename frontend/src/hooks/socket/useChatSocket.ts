// src/hooks/useChatSocket.ts

import type { IMessage } from '@stomp/stompjs';
import { Client } from '@stomp/stompjs';
import { useEffect, useRef } from 'react';
import SockJS from 'sockjs-client';
import type { ChatMessage } from '../../apis/chat/chat.type';

export const useChatSocket = (
  roomId: number,
  onMessage: (message: ChatMessage) => void,
): Client | null => {
  const clientRef = useRef<Client | null>(null);

  useEffect(() => {
    if (isNaN(roomId)) return;

    const socket = new SockJS('http://localhost:8080/ws-chat');
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      onConnect: () => {
        console.log('🟢 WebSocket 연결 성공');

        client.subscribe(`/topic/chat/${roomId}`, (message: IMessage) => {
          const payload: ChatMessage = JSON.parse(message.body);
          onMessage(payload);
        });
      },
      onStompError: (frame) => {
        console.error('❌ STOMP 에러:', frame);
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      console.log('🔴 WebSocket 연결 해제');
      client.deactivate();
    };
  }, [roomId, onMessage]);

  return clientRef.current;
};
