import type { IMessage } from '@stomp/stompjs';
import { Client } from '@stomp/stompjs';
import { useEffect, useRef, useCallback } from 'react';
import createWebSocketConnection from '../../lib/websocketInstance';
import type { PositionRequestDto, PositionResponseDto, UserJoinNotificationDto, WebSocketMessage } from '../../apis/leaderboard/leaderboard.types';
import type { AppointmentResponse } from '../../apis/room/room.types';

export const useLeaderboardSocket = (
  roomId: number,
  onLeaderboardUpdate: (positions: PositionResponseDto[]) => void,
  onUserJoin?: (notification: UserJoinNotificationDto) => void,
  appointmentData?: AppointmentResponse | null,
  isLoadingAppointment?: boolean,
): { client: Client | null; sendPosition: (request: PositionRequestDto) => void } => {
  const clientRef = useRef<Client | null>(null);
  const isConnectedRef = useRef<boolean>(false);
  const onLeaderboardUpdateRef = useRef(onLeaderboardUpdate);
  const onUserJoinRef = useRef(onUserJoin);
  
  // onLeaderboardUpdate 함수를 ref로 관리
  useEffect(() => {
    onLeaderboardUpdateRef.current = onLeaderboardUpdate;
  }, [onLeaderboardUpdate]);

  // onUserJoin 함수를 ref로 관리
  useEffect(() => {
    onUserJoinRef.current = onUserJoin;
  }, [onUserJoin]);

  useEffect(() => {
    console.log('🔍 WebSocket 연결 조건 확인:', {
      roomId,
      isLoadingAppointment,
      hasLocationLat: !!appointmentData?.locationLat,
      hasLocationLng: !!appointmentData?.locationLng,
      isAlreadyConnected: isConnectedRef.current,
      isClientConnected: clientRef.current?.connected
    });

    if (isNaN(roomId)) {
      console.log('⚠️ roomId가 유효하지 않음');
      return;
    }
    
    // 이미 연결되어 있으면 재연결하지 않음
    if (isConnectedRef.current && clientRef.current?.connected) {
      console.log('✅ 이미 연결되어 있음');
      return;
    }
    
    // 약속 정보가 로딩 중이면 WebSocket 연결하지 않음
    if (isLoadingAppointment) {
      console.log('⚠️ 약속 정보 로딩 중');
      return;
    }
    
    // 약속 정보가 설정되지 않았어도 WebSocket 연결 허용 (위치 전송은 나중에 처리)
    if (!appointmentData?.locationLat || !appointmentData?.locationLng) {
      console.log('⚠️ 약속 정보 위치 정보 없음 - 하지만 WebSocket 연결은 허용');
    }

    // 이전 연결이 있다면 정리
    if (clientRef.current) {
      console.log('🧹 이전 연결 정리');
      clientRef.current.deactivate();
      clientRef.current = null;
      isConnectedRef.current = false;
    }

    console.log('🔄 WebSocket 연결 시도...');
    
    const socket = createWebSocketConnection('/ws-leaderboard-native');
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      onConnect: () => {
        console.log('✅ WebSocket 연결 성공');
        isConnectedRef.current = true;

        client.subscribe(`/topic/leaderboard/${roomId}`, (message: IMessage) => {
          const payload: WebSocketMessage = JSON.parse(message.body);
          
          // 메시지 타입에 따라 처리
          if (Array.isArray(payload)) {
            // 위치 데이터 업데이트
            console.log('📡 위치 데이터 업데이트 수신:', payload.length, '명');
            onLeaderboardUpdateRef.current(payload);
          } else if (payload.type === 'USER_JOIN') {
            // 새로운 사용자 참가 알림
            console.log('👋 새로운 사용자 참가 알림:', payload);
            if (onUserJoinRef.current) {
              onUserJoinRef.current(payload);
            }
          } else {
            console.log('❓ 알 수 없는 메시지 타입:', payload);
          }
        });
      },
      onDisconnect: () => {
        console.log('🔴 WebSocket 연결 해제');
        isConnectedRef.current = false;
      },
      onStompError: (frame) => {
        console.error('❌ Leaderboard STOMP 에러:', frame);
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      console.log('🧹 useEffect cleanup');
      isConnectedRef.current = false;
      if (clientRef.current) {
        clientRef.current.deactivate();
        clientRef.current = null;
      }
    };
  }, [roomId]);

  // 위치 전송 함수
  const sendPosition = useCallback((request: PositionRequestDto) => {
    if (clientRef.current && clientRef.current.connected) {
      try {
        clientRef.current.publish({
          destination: '/app/leaderboard/update',
          body: JSON.stringify(request),
        });
      } catch (error) {
        console.error('❌ 위치 전송 실패:', error);
      }
    }
  }, []);

  return { client: clientRef.current, sendPosition };
}; 