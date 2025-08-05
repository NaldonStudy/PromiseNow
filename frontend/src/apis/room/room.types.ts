// 미리 room 상태 정의
export type RoomState = 'WAITING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

// ------ Request 타입들 ------
// 방 생성 요청
export interface CreateRoomRequest {
  roomTitle: string;
}

// 방 제목 수정 요청
export interface TitleUpdateRequest {
  roomTitle: string;
}

// 약속 가능 날짜 범위 수정
export interface DateRangeUpdateRequest {
  startDate: string;
  endDate: string;
}

// 약속 상세정보 수정
export interface AppointmentUpdateRequest {
  locationDate: string;
  locationTime: string;
  locationName: string;
  locationLat: number;
  locationLng: number;
}

// ------ Response 타입들 -----
// 약속 상세정보 응답
export interface AppointmentResponse {
  locationDate: string;
  locationTime: string;
  locationName: string;
  locationLat: number;
  locationLng: number;
}

// 방 생성
export interface CreateRoomResponse {
  roomTitle: string;
  roomCode: string;
}

// 약속 가능범위 설정
export interface DateRangeResponse {
  startDate: string;
  endDate: string;
}

// 내가 참가한 방들의 정보
export interface RoomListItem {
  roomId: number;
  roomTitle: string;
  locationDate: string;
  locationTime: string;
  locationName: string;
  participantSummary: string;
}

// 방 상태 응답
export interface StateResponse {
  roomState: RoomState;
}

// 방 제목 + 초대코드
export interface TitleCodeResponse {
  roomTitle: string;
  inviteCode: string;
}
