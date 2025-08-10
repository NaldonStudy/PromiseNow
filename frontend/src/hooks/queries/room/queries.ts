import { useQuery } from '@tanstack/react-query';
import {
  getAppointment,
  getJoinedRoom,
  getRoomDateRange,
  getRoomTitleAndCode,
} from '../../../apis/room/room.api';
import { getRoomUserInfo, getUsersInRoom } from '../../../apis/room/roomuser.api';
import type {
  AppointmentResponse,
  DateRangeResponse,
  RoomListItem,
  TitleCodeResponse,
} from '../../../apis/room/room.types';
import type {
  GetUsersInRoomResponse,
  RoomUserInfoResponse,
} from '../../../apis/room/roomuser.types';
import { roomKeys } from './keys';

// 내가 참가한 방 목록
export const useJoinedRooms = (userId: number) => {
  return useQuery<RoomListItem[]>({
    queryKey: roomKeys.list(userId),
    queryFn: async () => {
      const result = await getJoinedRoom(userId);
      if (result === null) throw new Error('참가한 방 목록 조회 실패');
      return result;
    },
    enabled: !!userId,
  });
};

// 방 제목 + 초대코드
export const useRoomTitleCode = (roomId: number) => {
  return useQuery<TitleCodeResponse>({
    queryKey: roomKeys.titleCode(roomId),
    queryFn: async () => {
      const result = await getRoomTitleAndCode(roomId);
      if (result === null) throw new Error('방 제목 및 초대코드 조회 실패');
      return result;
    },
    enabled: !!roomId,
  });
};

// 약속 가능 기간 조회
export const useRoomDateRange = (roomId: number) => {
  return useQuery<DateRangeResponse>({
    queryKey: roomKeys.dateRange(roomId),
    queryFn: async () => {
      const result = await getRoomDateRange(roomId);
      if (result === null) throw new Error('약속 가능 기간 조회 실패');
      return result;
    },
    enabled: !!roomId,
  });
};

// 약속 상세 조회
export const useAppointment = (roomId: number) => {
  return useQuery<AppointmentResponse>({
    queryKey: roomKeys.appointment(roomId),
    queryFn: async () => {
      const result = await getAppointment(roomId);
      if (result === null) throw new Error('약속 상세 조회 실패');
      return result;
    },
    enabled: !!roomId,
  });
};

// 방 참가자 목록 조회
export const useUsersInRoom = (roomId: number) => {
  return useQuery<GetUsersInRoomResponse>({
    queryKey: roomKeys.users(roomId),
    queryFn: async () => {
      const result = await getUsersInRoom(roomId);
      if (result === null) throw new Error('참가자 목록 조회 실패');
      return result;
    },
    enabled: !!roomId,
  });
};

// 방 사용자 정보 조회
export const useRoomUserInfo = (roomId: number, userId: number) => {
  return useQuery<RoomUserInfoResponse>({
    queryKey: roomKeys.userInfo(roomId, userId),
    queryFn: async () => {
      const result = await getRoomUserInfo(roomId, userId);
      if (result === null) throw new Error('방 사용자 정보 조회 실패');
      return result;
    },
    enabled: !!roomId && !!userId,
  });
};
