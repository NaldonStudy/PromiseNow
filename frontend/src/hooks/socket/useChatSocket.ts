// src/hooks/useChatSocket.ts
import type { IMessage } from '@stomp/stompjs';
import { Client } from '@stomp/stompjs';
import { useCallback, useEffect, useRef, useState } from 'react';
import createWebSocketConnection from '../../lib/websocketInstance';

type Options = {
  subscribeDest?: (roomId: number) => string; // e.g. (id)=>`/topic/chat/${id}`
  publishDest?: string; // default: /app/chat
};

export const useChatSocket = (
  roomId: number,
  onMessage: (payload: Record<string, unknown>) => void,
  options: Options = {},
) => {
  const clientRef = useRef<Client | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const connectingRef = useRef(false);

  // 최신 onMessage / options 를 ref로 유지 (deps에 함수 안 넣기 위함)
  const onMessageRef = useRef(onMessage);
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  const subDestRef = useRef<Options['subscribeDest']>(options.subscribeDest);
  useEffect(() => {
    subDestRef.current = options.subscribeDest;
  }, [options.subscribeDest]);

  const pubDestRef = useRef<string>(options.publishDest ?? '/app/chat');
  useEffect(() => {
    pubDestRef.current = options.publishDest ?? '/app/chat';
  }, [options.publishDest]);

  useEffect(() => {
    if (Number.isNaN(roomId)) {
      console.warn('[WS] invalid roomId', roomId);
      return;
    }

    // 이미 연결 중이면 중복 방지
    if (connectingRef.current) {
      
      return;
    }

    connectingRef.current = true;

    // 기존 연결이 있으면 정리
    if (clientRef.current) {
      console.log(`[WS] 기존 연결 정리: roomId=${roomId}`);
      clientRef.current.deactivate();
      clientRef.current = null;
    }

    
    const socket = createWebSocketConnection('/ws-chat-native');
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
                   debug: () => {}, // 프로덕션에서는 디버그 로그 비활성화
      onConnect: () => {
        
        setIsConnected(true);
        connectingRef.current = false;
        const topic = subDestRef.current ? subDestRef.current(roomId) : `/topic/chat/${roomId}`;
        
        client.subscribe(topic, (msg: IMessage) => {
          try {
            const payload = JSON.parse(msg.body);
            
            onMessageRef.current(payload);
          } catch (e) {
            console.error('[WS] parse error', e, msg.body);
          }
        });
      },
      onDisconnect: () => {
        
        setIsConnected(false);
        connectingRef.current = false;
      },
      onStompError: (f) => {
        console.error('[WS] STOMP error', f);
        connectingRef.current = false;
      },
      onWebSocketError: (e) => {
        console.error('[WS] socket error', e);
        connectingRef.current = false;
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      connectingRef.current = false;
      if (clientRef.current) {
        clientRef.current.deactivate();
        clientRef.current = null;
      }
    };
    // deps는 원시값만: 함수(ref로 보관)는 넣지 않음 → 재연결 루프 방지 + lint 통과
  }, [roomId]);

  const sendMessage = useCallback(
    (body: Record<string, unknown>) => {
      const client = clientRef.current;
      if (!client || !isConnected) {
        
        return;
      }
      client.publish({
        destination: pubDestRef.current,
        body: JSON.stringify(body),
        headers: { 'content-type': 'application/json' },
      });
    },
    [isConnected],
  );

  return { client: clientRef.current, isConnected, sendMessage };
};
