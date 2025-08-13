// src/hooks/useChatSocket.ts
import type { IMessage } from '@stomp/stompjs';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

import { useCallback, useEffect, useRef, useState } from 'react';

type Options = {
  wsBase?: string; // e.g. https://api.promisenow.store/ws-chat
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

  const wsBase = options.wsBase ?? 'https://api.promisenow.store/ws-chat';

  useEffect(() => {
    if (Number.isNaN(roomId)) {
      console.warn('[WS] invalid roomId', roomId);
      return;
    }

    const sock = new SockJS(wsBase);
    const client = new Client({
      webSocketFactory: () => sock as unknown as WebSocket,
      reconnectDelay: 5000,
      debug: (s) => console.log('[STOMP]', s),
      onConnect: () => {
        setIsConnected(true);
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
      onDisconnect: () => setIsConnected(false),
      onStompError: (f) => console.error('[WS] STOMP error', f),
      onWebSocketError: (e) => console.error('[WS] socket error', e),
    });

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
      clientRef.current = null;
    };
    // deps는 원시값만: 함수(ref로 보관)는 넣지 않음 → 재연결 루프 방지 + lint 통과
  }, [roomId, wsBase]);

  const sendMessage = useCallback(
    (body: Record<string, unknown>) => {
      const client = clientRef.current;
      if (!client || !isConnected) {
        console.warn('[WS] not connected');
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
