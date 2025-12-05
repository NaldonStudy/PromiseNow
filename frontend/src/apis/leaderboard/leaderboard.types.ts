// 도착 랭킹 관련 타입 정의

// 서버에서 받는 위치 정보 응답
export interface PositionResponseDto {
  roomUserId: number;
  lat: number;
  lng: number;
  online: boolean;
  velocity: number;
  distance: number;
  progress: number;
  arrived: boolean;
  estimatedArrivalMinutes?: number; // 예상 도착 시간 (분)
}

// 클라이언트에서 서버로 보내는 위치 정보 요청
export interface PositionRequestDto {
  roomId: number;
  roomUserId: number;
  lat: number;
  lng: number;
  online: boolean;
}

// 도착 랭킹 아이템 표시용 타입
export interface ArrivalRankingItem {
  rank: number;
  roomUserId: number;
  name: string;
  imgUrl?: string;
  progress: number;
  distance: number;
  speed: number;
  arrived: boolean;
  online: boolean;
  estimatedArrivalMinutes?: number; // 예상 도착 시간 (분)
}

// 새로운 사용자 참가 알림 타입
export interface UserJoinNotificationDto {
  type: 'USER_JOIN';
  roomId: number;
  roomUserId: number;
  nickname: string;
  timestamp: number;
}

// WebSocket 메시지 통합 타입
export type WebSocketMessage = PositionResponseDto[] | UserJoinNotificationDto; 