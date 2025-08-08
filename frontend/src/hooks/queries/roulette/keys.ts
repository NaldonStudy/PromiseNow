import { useQueryClient } from '@tanstack/react-query';

// Query Keys
export const rouletteKeys = {
  all: ['roulette'] as const,
  room: (roomId: number) => [...rouletteKeys.all, 'room', roomId] as const,
  list: (roomId: number) => [...rouletteKeys.all, 'list', roomId] as const,
};

export const useInvalidateRouletteQueries = () => {
  const queryClient = useQueryClient();

  // 전체 무효화
  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: rouletteKeys.all });
  };

  // 특정 룸 룰렛 리스트 무효화
  const invalidateList = (roomId: number) => {
    queryClient.invalidateQueries({ queryKey: rouletteKeys.list(roomId) });
  };

  return {
    invalidateAll,
    invalidateList,
  };
};
