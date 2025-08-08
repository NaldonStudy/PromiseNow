// src/hooks/socket/useChatSocket.ts
import { useEffect, useRef, useState } from 'react';
import { Client } from '@stomp/stompjs';
import type { IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

type OnMessage = (payload: unknown) => void;

export const useChatSocket = (
  roomId: number,
  onMessage: OnMessage,
  {
    // 서버 SockJS 엔드포인트 (필요 시 env로)
    wsBase = 'http://localhost:8080/ws-chat',
    // 서버가 푸시하는 구독 경로
    subscribeDest = (id: number) => `/topic/chat/${id}`,
    // 연결 유지를 위한 하트비트(선택)
    heartbeat = { incoming: 10000, outgoing: 10000 },
    // 인증이 필요하면 여기에 헤더 추가
    connectHeaders = {} as Record<string, string>,
  } = {}
) => {
  const clientRef = useRef<Client | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (isNaN(roomId)) return;

    // 1) SockJS 소켓 생성
    const socket = new SockJS(wsBase);

    // 2) STOMP 클라이언트 구성
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000, // 연결 끊기면 5초 마다 재시도
      heartbeatIncoming: heartbeat.incoming,
      heartbeatOutgoing: heartbeat.outgoing,
      connectHeaders,
      onConnect: () => {
        console.log('🟢 WS connected');
        setIsConnected(true);

        // 3) 방 구독
        client.subscribe(subscribeDest(roomId), (frame: IMessage) => {
          try {
            // 서버에서 온 메시지(body는 문자열) → JSON 파싱
            const payload = JSON.parse(frame.body);
            onMessage(payload);
          } catch (e) {
            console.error('parse error:', e);
          }
        });
      },
      onDisconnect: () => {
        console.log('🔴 WS disconnected');
        setIsConnected(false);
      },
      onStompError: (err) => {
        console.error('❌ STOMP error:', err);
      },
      debug: () => {}, // 로그 소음 줄이기
    });

    // 4) 연결 시작
    client.activate();
    clientRef.current = client;

    // 5) 언마운트/roomId 변경 시 해제
    return () => {
      client.deactivate();
      clientRef.current = null;
      setIsConnected(false);
    };
  }, [roomId, wsBase, subscribeDest, heartbeat.incoming, heartbeat.outgoing, onMessage, connectHeaders]);

  return { client: clientRef.current, isConnected };
};
