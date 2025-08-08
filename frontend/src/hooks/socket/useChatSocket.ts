// src/hooks/useChatSocket.ts
import type { IMessage } from '@stomp/stompjs';
import { Client } from '@stomp/stompjs';
import { useCallback, useEffect, useRef, useState } from 'react';
import SockJS from 'sockjs-client';

type Json = Record<string, unknown>;

export const useChatSocket = (
  roomId: number,
  onMessage: (message: unknown) => void,
  {
    subscribeDest = (id: number) => `/topic/chat/${id}`,
    publishDest = (id: number) => `/app/chat/${id}`,
    baseUrl = import.meta.env.VITE_WS_BASE || 'http://localhost:8080/ws-chat',
    heartbeat = { incoming: 10000, outgoing: 10000 },
  } = {},
) => {
  const clientRef = useRef<Client | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (isNaN(roomId)) return;

    const socket = new SockJS(baseUrl);
    const c = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      heartbeatIncoming: heartbeat.incoming,
      heartbeatOutgoing: heartbeat.outgoing,
      onConnect: () => {
        setIsConnected(true);
        c.subscribe(subscribeDest(roomId), (msg: IMessage) => {
          try {
            onMessage(JSON.parse(msg.body));
          } catch {
            onMessage(msg.body);
          }
        });
      },
      onDisconnect: () => setIsConnected(false),
      onStompError: () => setIsConnected(false),
      debug: () => {}, // 콘솔 소음 방지
    });

    c.activate();
    clientRef.current = c;
    setClient(c);

    return () => {
      c.deactivate();
      setIsConnected(false);
      clientRef.current = null;
      setClient(null);
    };
  }, [roomId, baseUrl, onMessage, subscribeDest, heartbeat.incoming, heartbeat.outgoing]);

  const sendJson = useCallback(
    (payload: Json) => {
      if (!clientRef.current || !isConnected) return;
      clientRef.current.publish({
        destination: publishDest(roomId),
        body: JSON.stringify(payload),
      });
    },
    [roomId, publishDest, isConnected],
  );

  return { client, isConnected, sendJson };
};
