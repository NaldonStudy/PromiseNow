import axiosInstance from '../../lib/axiosInstance';
import handleApi from '../../lib/handleApi';
import type {
  CreateRoomRequest,
  TitleUpdateRequest,
  DateRangeUpdateRequest,
  AppointmentUpdateRequest,
  AppointmentResponse,
  CreateRoomResponse,
  DateRangeResponse,
  RoomListItem,
  StateResponse,
  TitleCodeResponse,
  RoomState,
} from './room.types';

// 방 생성
export const createRoom = async (request: CreateRoomRequest) => {
  const data = await handleApi<CreateRoomResponse>(axiosInstance.post('/rooms', request));
  return data;
};

// 방 삭제
export const deleteRoom = async (roomId: number) => {
  const data = await handleApi<void>(axiosInstance.delete(`/rooms/${roomId}`));
  return data;
};

// 방 제목 + 초대코드 조회
export const getRoomTitleAndCode = async (roomId: number) => {
  const data = await handleApi<TitleCodeResponse>(axiosInstance.get(`/rooms/${roomId}/title-code`));
  return data;
};

// 방 상태 조회
export const getRoomStatus = async (roomId: number) => {
  const data = await handleApi<StateResponse>(axiosInstance.get(`/rooms/${roomId}/status`));
  return data;
};

// 약속 가능 기간 조회
export const getRoomDateRange = async (roomId: number) => {
  const data = await handleApi<DateRangeResponse>(axiosInstance.get(`/rooms/${roomId}/date-range`));
  return data;
};

// 세부약속 조회
export const getAppointment = async (roomId: number) => {
  const data = await handleApi<AppointmentResponse>(
    axiosInstance.get(`/rooms/${roomId}/appointment`),
  );
  return data;
};

// 내가 참가한 방 목록 조회
export const getJoinedRoom = async (userId: number) => {
  const data = await handleApi<RoomListItem[]>(axiosInstance.get(`/rooms/${userId}`));
  return data;
};

// 방 제목 수정
export const updateRoomTitle = async (roomId: number, request: TitleUpdateRequest) => {
  const data = await handleApi<void>(axiosInstance.patch(`/rooms/${roomId}/title`, request));
  return data;
};

// 약속 가능 기간 설정
export const updateRoomDateRange = async (roomId: number, request: DateRangeUpdateRequest) => {
  const data = await handleApi<void>(axiosInstance.patch(`/rooms/${roomId}/date-range`, request));
  return data;
};

// 세부 약속 정보 설정
export const updateAppointment = async (roomId: number, request: AppointmentUpdateRequest) => {
  const data = await handleApi<void>(axiosInstance.patch(`/rooms/${roomId}/appointment`, request));
  return data;
};

// 방 상태 변경 (WAITING, ACTIVE, COMPLETED, CANCELLED)
export const updateRoomState = async (roomId: number, newState: RoomState) => {
  const path = newState.toLowerCase();
  const data = await handleApi<void>(axiosInstance.patch(`/rooms/${roomId}/state/${path}`));
  return data;
};
