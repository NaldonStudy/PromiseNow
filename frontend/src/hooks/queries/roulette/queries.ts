import { useQuery } from '@tanstack/react-query';
import { getRoulette } from '../../../apis/roulette/roulette.api';
import type { RouletteResponse } from '../../../apis/roulette/roulette.types';
import { rouletteKeys } from './keys';

// 룰렛 목록 조회
export const useRouletteList = (roomId: number) => {
  return useQuery<RouletteResponse[]>({
    queryKey: rouletteKeys.list(roomId),
    queryFn: async () => {
      const result = await getRoulette(roomId);
      if (result === null) throw new Error('룰렛 목록 조회 실패');
      return result;
    },
    enabled: !!roomId,
  });
};
