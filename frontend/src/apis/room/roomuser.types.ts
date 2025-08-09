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

//방 참가자 닉네임 수정
export interface UpdateNicknameRequest {
  nickname: string;
}

// 프로필 이미지 수정 요청
export interface UpdateProfileRequest {
  file: File;
}

// 방 나가기
export interface QuitRoomRequest {
  roomId: number;
  userId: number;
}

// 방 삭제하기
export interface DeleteRoomRequest {
  roomId: number;
}

// ------ Response 타입들 ------
// 방 참가시 응답 정보
export interface JoinInfoResponse {
  roomId: number;
  roomTitle: string;
  nickname: string;
  roomUserId: number;
}

// 참가자 요약 정보
export interface SimpleInfoResponse {
  nickname: string;
  profileImage: string | null;
}

// 방 참가자 목록 응답
export type GetUsersInRoomResponse = SimpleInfoResponse[];

// 알림 설정 응답
export interface AlarmSettingResponse {
  isAgreed: boolean;
}

// 닉네임 변경 응답
export interface UpdateNicknameResponse {
  nickname: string;
}

// 프로필 이미지 수정 응답
export interface UpdateProfileResponse {
  imageUrl: string;
}
