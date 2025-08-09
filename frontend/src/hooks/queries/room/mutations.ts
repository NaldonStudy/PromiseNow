import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createRoom,
  updateAppointment,
  updateRoomDateRange,
  updateRoomTitle,
} from '../../../apis/room/room.api';
import type {
  AppointmentUpdateRequest,
  CreateRoomRequest,
  DateRangeUpdateRequest,
  TitleUpdateRequest,
} from '../../../apis/room/room.types';
import {
  deleteRoom,
  joinRoomByInviteCode,
  quitRoom,
  updateAlarmSetting,
  updateNickname,
  updateProfileImage,
} from '../../../apis/room/roomuser.api';
import type {
  AlarmUpdateRequest,
  DeleteRoomRequest,
  JoinRequest,
  QuitRoomRequest,
  UpdateNicknameRequest,
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

// 방 삭제
export const useDeleteRoom = (roomId: number, userId: number) => {
  const qc = useQueryClient();

  return useMutation({
    // 삭제 API는 roomId만 필요
    mutationFn: () => deleteRoom({ roomId } as DeleteRoomRequest),

    onSuccess: () => {
      // 1) 삭제된 방의 상세/관련 쿼리들은 재요청하지 않도록 제거
      qc.removeQueries({ queryKey: ['room', roomId], exact: false });
      qc.removeQueries({ queryKey: ['room', roomId, 'users'], exact: false });

      // 2) 내가 참여한 방 목록만 새로고침 (UI에서 목록에서 사라지도록)
      qc.invalidateQueries({ queryKey: ['joinedRooms', userId] });
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

// 방 참가자 닉네임 수정
export const useUpdateNickname = (userId: number | null, roomId?: number) => {
  const { invalidateRoom } = useInvalidateRoomQueries();

  return useMutation({
    mutationFn: async (request: UpdateNicknameRequest) => {
      if (userId === null || roomId === undefined) {
        throw new Error('userId 또는 roomId가 유효하지 않음');
      }
      return updateNickname(roomId, userId, request); // 인자 순서 수정!
    },
    onSuccess: () => {
      if (userId !== null && roomId !== undefined) {
        invalidateRoom({ userId, roomId });
      }
    },
  });
};

// 프로필 이미지 수정
export const useUpdateProfileImage = () =>
  useMutation({
    mutationFn: ({ roomId, userId, file }: { roomId: number; userId: number; file: File }) =>
      updateProfileImage(roomId, userId, { file }),
  });
