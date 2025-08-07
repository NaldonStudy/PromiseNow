import { useQueryClient } from '@tanstack/react-query';

// Query Keys
export const availabilityKeys = {
  all: ['availability'] as const,
  total: (roomId: number) => [...availabilityKeys.all, 'total', roomId] as const,
  my: (roomUserId: number) => [...availabilityKeys.all, 'my', roomUserId] as const,
  confirmedUsers: (roomId: number, date: string, slot: number) =>
    [...availabilityKeys.all, 'confirmedUsers', roomId, date, slot] as const,
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
  };

  return {
    invalidateAll,
    invalidateRoom,
  };
};
