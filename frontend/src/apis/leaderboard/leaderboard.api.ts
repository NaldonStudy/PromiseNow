import axiosInstance from '../../lib/axiosInstance';
import handleApi from '../../lib/handleApi';
import type { PositionResponseDto } from './leaderboard.types';

// 리더보드 초기 데이터 조회
export const getLeaderboard = async (roomId: number) => {
  const data = await handleApi<PositionResponseDto[]>(
    axiosInstance.get(`/leaderboard/${roomId}`),
  );
  return data;
}; 