// src/hooks/useChatSocket.ts

import { useEffect, useRef } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import type { IMessage } from '@stomp/stompjs';
import type { MessageResponseDto } from './../../types/chat.type';

export const useChatSocket = (
  roomId: number,
  onMessage: (message: MessageResponseDto) => void
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
          const payload: MessageResponseDto = JSON.parse(message.body);
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
