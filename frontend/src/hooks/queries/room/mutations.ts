import { useMutation } from '@tanstack/react-query';
import {
  createRoom,
  deleteRoom,
  updateAppointment,
  updateRoomDateRange,
  updateRoomState,
  updateRoomTitle,
} from '../../../apis/room/room.api';
import type {
  AppointmentUpdateRequest,
  CreateRoomRequest,
  DateRangeUpdateRequest,
  RoomState,
  TitleUpdateRequest,
} from '../../../apis/room/room.types';
import {
  joinRoomByInviteCode,
  quitRoom,
  updateAlarmSetting,
} from '../../../apis/room/roomuser.api';
import type {
  AlarmUpdateRequest,
  JoinRequest,
  QuitRoomRequest,
} from '../../../apis/room/roomuser.types';
import { useInvalidateRoomQueries } from './keys';

// 방 생성
export const useCreateRoom = (userId: number) => {
  const { invalidateRoom } = useInvalidateRoomQueries();

  return useMutation({
    mutationFn: (request: CreateRoomRequest) => createRoom(request),
    onSuccess: () => {
      invalidateRoom({ userId });
    },
  });
};

// 방 제목 수정
export const useUpdateRoomTitle = (roomId: number) => {
  const { invalidateRoom } = useInvalidateRoomQueries();

  return useMutation({
    mutationFn: (request: TitleUpdateRequest) => updateRoomTitle(roomId, request),
    onSuccess: () => {
      invalidateRoom({ roomId });
    },
  });
};

// 약속 가능 기간 수정
export const useUpdateRoomDateRange = (roomId: number) => {
  const { invalidateRoom } = useInvalidateRoomQueries();

  return useMutation({
    mutationFn: (request: DateRangeUpdateRequest) => updateRoomDateRange(roomId, request),
    onSuccess: () => {
      invalidateRoom({ roomId });
    },
  });
};

// 약속 상세 정보 수정
export const useUpdateAppointment = (roomId: number) => {
  const { invalidateRoom } = useInvalidateRoomQueries();

  return useMutation({
    mutationFn: (request: AppointmentUpdateRequest) => updateAppointment(roomId, request),
    onSuccess: () => {
      invalidateRoom({ roomId });
    },
  });
};

// 방 상태 변경
export const useUpdateRoomState = (roomId: number) => {
  const { invalidateRoom } = useInvalidateRoomQueries();

  return useMutation({
    mutationFn: (newState: RoomState) => updateRoomState(roomId, newState),
    onSuccess: () => {
      invalidateRoom({ roomId });
    },
  });
};

// 방 삭제
export const useDeleteRoom = (roomId: number, userId: number) => {
  const { invalidateRoom } = useInvalidateRoomQueries();

  return useMutation({
    mutationFn: () => deleteRoom(roomId),
    onSuccess: () => {
      invalidateRoom({ roomId, userId });
    },
  });
};

// 초대코드로 참가
export const useJoinRoomByInviteCode = (userId: number) => {
  const { invalidateRoom } = useInvalidateRoomQueries();

  return useMutation({
    mutationFn: (request: JoinRequest) => joinRoomByInviteCode(request),
    onSuccess: () => {
      invalidateRoom({ userId });
    },
  });
};

// 방 나가기
export const useQuitRoom = (roomId: number, userId: number) => {
  const { invalidateRoom } = useInvalidateRoomQueries();

  return useMutation({
    mutationFn: (request: QuitRoomRequest) => quitRoom(request),
    onSuccess: () => {
      invalidateRoom({ roomId, userId });
    },
  });
};

// 알람 설정 변경
export const useUpdateAlarmSetting = (roomId: number, userId: number) => {
  const { invalidateRoom } = useInvalidateRoomQueries();

  return useMutation({
    mutationFn: (request: AlarmUpdateRequest) => updateAlarmSetting(roomId, userId, request),
    onSuccess: () => {
      invalidateRoom({ roomId, userId });
    },
  });
};
