import { useQueryClient } from '@tanstack/react-query';

// Query Keys
export const availabilityKeys = {
  all: ['availability'] as const,
  total: (roomId: number) => [...availabilityKeys.all, 'total', roomId] as const,
  my: (roomUserId: number) => [...availabilityKeys.all, 'my', roomUserId] as const,
  confirmedUsers: (roomId: number, date: string, slot: number) =>
    [...availabilityKeys.all, 'confirmedUsers', roomId, date, slot] as const,
  dateConfirmedUsers: (roomId: number, date: string) =>
    [...availabilityKeys.all, 'dateConfirmedUsers', roomId, date] as const,
  recommendTime: (roomId: number) => ['availability', 'recommendTime', roomId],
};

// 전체 쿼리 무효화 훅
export const useInvalidateAvailabilityQueries = () => {
  const queryClient = useQueryClient();

  // 전체 쿼리 무효화
  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: availabilityKeys.all });
  };

  // 특정 room 무효화
  const invalidateRoom = (roomId: number, roomUserId: number) => {
    queryClient.invalidateQueries({ queryKey: availabilityKeys.total(roomId) });
    queryClient.invalidateQueries({ queryKey: availabilityKeys.my(roomUserId) });
    queryClient.invalidateQueries({
      queryKey: [...availabilityKeys.all, 'confirmedUsers', roomId],
    });
    queryClient.invalidateQueries({
      queryKey: [...availabilityKeys.all, 'dateConfirmedUsers', roomId],
    });
    queryClient.invalidateQueries({ queryKey: availabilityKeys.recommendTime(roomId) });
  };

  return {
    invalidateAll,
    invalidateRoom,
  };
};
