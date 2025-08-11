import { useQueryClient } from '@tanstack/react-query';

// Query Keys
export const roomKeys = {
  all: ['room'] as const,
  list: (userId: number) => [...roomKeys.all, 'list', userId] as const,
  detail: (roomId: number) => [...roomKeys.all, 'detail', roomId] as const,
  status: (roomId: number) => [...roomKeys.detail(roomId), 'status'] as const,
  appointment: (roomId: number) => [...roomKeys.detail(roomId), 'appointment'] as const,
  dateRange: (roomId: number) => [...roomKeys.detail(roomId), 'date-range'] as const,
  titleCode: (roomId: number) => [...roomKeys.detail(roomId), 'title-code'] as const,
  users: (roomId: number) => [...roomKeys.detail(roomId), 'users'] as const,
  myInfo: (roomId: number, userId: number) =>
    [...roomKeys.detail(roomId), 'my-info', userId] as const,
};

export const useInvalidateRoomQueries = () => {
  const queryClient = useQueryClient();

  // 전체 쿼리 무효화
  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: roomKeys.all });
  };

  // 특정 room 무효화
  const invalidateRoom = ({ roomId, userId }: { roomId?: number; userId?: number }) => {
    if (roomId !== undefined) {
      queryClient.invalidateQueries({ queryKey: roomKeys.detail(roomId) });
      queryClient.invalidateQueries({ queryKey: roomKeys.status(roomId) });
      queryClient.invalidateQueries({ queryKey: roomKeys.appointment(roomId) });
      queryClient.invalidateQueries({ queryKey: roomKeys.dateRange(roomId) });
      queryClient.invalidateQueries({ queryKey: roomKeys.titleCode(roomId) });
      queryClient.invalidateQueries({ queryKey: roomKeys.users(roomId) });
    }

    if (userId !== undefined) {
      queryClient.invalidateQueries({ queryKey: roomKeys.list(userId) });
    }

    if (roomId !== undefined && userId !== undefined) {
      queryClient.invalidateQueries({ queryKey: roomKeys.myInfo(roomId, userId) });
    }
  };

  return {
    invalidateAll,
    invalidateRoom,
  };
};
