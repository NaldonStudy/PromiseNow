import axiosInstance from '../../lib/axiosInstance';
import handleApi from '../../lib/handleApi';

import type {
  RouletteCreateRequest,
  RouletteDeleteRequest,
  RouletteResponse,
  RouletteUpdateRequest,
} from './roulette.types';

// 룰렛 내용 생성
export const createRoulette = async (request: RouletteCreateRequest) => {
  const data = await handleApi<RouletteResponse>(axiosInstance.post('/roulette/create', request));
  return data;
};

// 룰렛 내용 수정
export const updateRoulette = async (rouletteId: number, request: RouletteUpdateRequest) => {
  const data = await handleApi<RouletteResponse>(
    axiosInstance.put(`/roulette/update/${rouletteId}`, request),
  );
  return data;
};

// 룰렛 내용 조회
export const getRoulette = async (roomId: number) => {
  const data = await handleApi<RouletteResponse[]>(axiosInstance.get(`/roulette/read/${roomId}`));
  return data;
};

// 룰렛 내용 삭제
export const deleteRoulette = async (rouletteId: number, request: RouletteDeleteRequest) => {
  const { roomId, roomUserId } = request;
  return handleApi<void>(
    axiosInstance.delete(
      `/roulette/delete/${rouletteId}?roomId=${roomId}&roomUserId=${roomUserId}`,
    ),
  );
};
