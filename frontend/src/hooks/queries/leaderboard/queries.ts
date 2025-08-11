import { useQuery } from '@tanstack/react-query';
import { getLeaderboard } from '../../../apis/leaderboard/leaderboard.api';
import type { PositionResponseDto } from '../../../apis/leaderboard/leaderboard.types';
import { leaderboardKeys } from './keys';

// 리더보드 초기 데이터 조회
export const useLeaderboard = (roomId: number) => {
  return useQuery<PositionResponseDto[]>({
    queryKey: leaderboardKeys.leaderboard(roomId),
    queryFn: async () => {
      const result = await getLeaderboard(roomId);
      if (result === null) throw new Error('리더보드 조회 실패');
      return result;
    },
    enabled: !!roomId,
    staleTime: 1000 * 30, // 30초간 캐시 유지
    refetchOnWindowFocus: false, // 윈도우 포커스 시 재요청 방지
  });
}; 