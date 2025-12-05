import axiosInstance from '../../lib/axiosInstance';
import handleApi from '../../lib/handleApi';
import type {
  AlarmSettingResponse,
  AlarmUpdateRequest,
  DeleteRoomRequest,
  GetUsersInRoomResponse,
  GetUsersInRoomDetailedResponse,
  JoinInfoResponse,
  JoinRequest,
  QuitRoomRequest,
  RoomUserInfoResponse,
  UpdateNicknameRequest,
  UpdateNicknameResponse,
  UpdateProfileRequest,
  UpdateProfileResponse,
} from './roomuser.types';

// 초대코드로 방 참가
export const joinRoomByInviteCode = async (request: JoinRequest) => {
  const data = await handleApi<JoinInfoResponse>(axiosInstance.post(`/rooms/join`, request));
  return data;
};

// 방 참가자 목록 조회
export const getUsersInRoom = async (roomId: number) => {
  const data = await handleApi<GetUsersInRoomResponse>(axiosInstance.get(`/rooms/${roomId}/users`));
  return data;
};

// 방 참가자 상세 목록 조회 (roomUserId 포함)
export const getUsersInRoomDetailed = async (roomId: number) => {
  const data = await handleApi<GetUsersInRoomDetailedResponse>(axiosInstance.get(`/rooms/${roomId}/users/detailed`));
  return data;
};

/// 방 사용자 정보 조회
export const getRoomUserInfo = async (roomId: number, userId: number) => {
  const data = await handleApi<RoomUserInfoResponse>(
    axiosInstance.get(`/rooms/${roomId}/me/${userId}`),
  );
  return data;
};

// 방 닉네임 수정
export const updateNickname = async (
  roomId: number,
  userId: number,
  payload: UpdateNicknameRequest,
) => {
  const data = await handleApi<UpdateNicknameResponse>(
    axiosInstance.patch(`/rooms/${roomId}/nickname/${userId}`, payload),
  );
  return data;
};

// 프로필 이미지 수정
export const updateProfileImage = async (
  roomId: number,
  userId: number,
  request: UpdateProfileRequest,
) => {
  const formdata = new FormData();
  formdata.append('file', request.file);

  const data = await handleApi<UpdateProfileResponse>(
    axiosInstance.patch(`/rooms/${roomId}/profile-image/${userId}`, formdata),
  );
  return data;
};

// 방 나가기
export const quitRoom = async ({ roomId, userId }: QuitRoomRequest) => {
  const data = await handleApi<void>(axiosInstance.delete(`/rooms/${roomId}/users/${userId}`));
  return data;
};

// 방 삭제하기
export const deleteRoom = async ({ roomId }: DeleteRoomRequest) => {
  const data = await handleApi<void>(axiosInstance.delete(`/rooms/${roomId}`));
  return data;
};

// 알림 상태 조회
export const getAlarmSetting = async (roomId: number, userId: number) => {
  const data = await handleApi<AlarmSettingResponse>(
    axiosInstance.get(`/rooms/${roomId}/users/${userId}/alarm`),
  );
  return data;
};

// 알람 설정 변경
export const updateAlarmSetting = async (
  roomId: number,
  userId: number,
  request: AlarmUpdateRequest,
) => {
  const data = await handleApi<void>(
    axiosInstance.patch(`/rooms/${roomId}/users/${userId}/alarm`, request),
  );
  return data;
};
