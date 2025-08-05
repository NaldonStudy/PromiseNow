// ------ Request 타입들 ------
// 알람 설정하기
export interface AlarmUpdateRequest {
  isAgreed: boolean;
}

// 초대코드로 방 참가 요청
export interface JoinRequest {
  inviteCode: string;
  userId: number;
  nickname: string;
}

// 방 재참가
export interface RejoinRoomRequest {
  roomId: number;
  userId: number;
}

// 방 나가기
export interface QuitRoomRequest {
  roomId: number;
  userId: number;
}

// ------ Response 타입들 ------
// 방 참가시 응답 정보
export interface JoinInfoResponse {
  roomId: number;
  roomTitle: string;
  nickname: string;
}

// 참가자 요약 정보
export interface SimpleInfoResponse {
  nickname: string;
  profileImage: string | null;
}

// 방 참가자 목록 응답
export interface GetUsersInRoomResponse {
  data: SimpleInfoResponse[];
}
