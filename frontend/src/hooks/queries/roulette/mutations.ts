import { useMutation } from '@tanstack/react-query';
import {
  createRoulette,
  deleteRoulette,
  updateRoulette,
} from '../../../apis/roulette/roulette.api';
import type {
  RouletteCreateRequest,
  RouletteDeleteRequest,
  RouletteUpdateRequest,
} from '../../../apis/roulette/roulette.types';
import { useInvalidateRouletteQueries } from './keys';

// 룰렛 생성
export const useCreateRoulette = (roomId: number) => {
  const { invalidateList } = useInvalidateRouletteQueries();

  return useMutation({
    mutationFn: (request: RouletteCreateRequest) => createRoulette(request),
    onSuccess: () => {
      invalidateList(roomId);
    },
  });
};

// 룰렛 수정
export const useUpdateRoulette = (roomId: number) => {
  const { invalidateList } = useInvalidateRouletteQueries();

  return useMutation({
    mutationFn: ({ rouletteId, payload }: { rouletteId: number; payload: RouletteUpdateRequest }) =>
      updateRoulette(rouletteId, payload),
    onSuccess: () => {
      invalidateList(roomId);
    },
  });
};

// 룰렛 삭제
export const useDeleteRoulette = (roomId: number) => {
  const { invalidateList } = useInvalidateRouletteQueries();

  return useMutation({
    mutationFn: ({ rouletteId, payload }: { rouletteId: number; payload: RouletteDeleteRequest }) =>
      deleteRoulette(rouletteId, payload),
    onSuccess: () => {
      invalidateList(roomId);
    },
  });
};
