import axiosInstance from '../../lib/axiosInstance';
import handleApi from '../../lib/handleApi';
import type {
  AlarmUpdateRequest,
  JoinInfoResponse,
  JoinRequest,
  RejoinRoomRequest,
  QuitRoomRequest,
  GetUsersInRoomResponse,
} from './roomuser.types';

// 초대코드로 방 참가
export const joinRoomByInviteCode = async (request: JoinRequest) => {
  const data = await handleApi<JoinInfoResponse>(axiosInstance.post(`/rooms/join`, request));
  return data;
};

// 기존 참가한 방 재입장
export const joinAlreadyParticipatedRoom = async (request: RejoinRoomRequest) => {
  const { roomId, userId } = request;
  const data = await handleApi<JoinInfoResponse>(
    axiosInstance.post(`/rooms/${roomId}/join`, null, { params: { userId } }),
  );
  return data;
};

// 방 나가기
export const quitRoom = async (request: QuitRoomRequest) => {
  const { roomId, userId } = request;
  const data = await handleApi<void>(
    axiosInstance.get(`/rooms/${roomId}/quit`, { params: { userId } }),
  );
  return data;
};

// 방 참가자 목록 조회
export const getUsersInRoom = async (roomId: number) => {
  const data = await handleApi<GetUsersInRoomResponse>(axiosInstance.get(`/rooms/${roomId}/users`));
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
