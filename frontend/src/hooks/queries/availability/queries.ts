import { useQuery } from '@tanstack/react-query';
import type {
  ConfirmedUsersResponse,
  MyAvailabilityResponse,
  RecommendTimeResponse,
  TotalAvailabilityResponse,
} from '../../../apis/availability/availability.types';
import { availabilityKeys } from './keys';
import {
  getConfirmedUsers,
  getDateConfirmedUsers,
  getMyAvailability,
  getRecommendTime,
  getTotalAvailability,
} from '../../../apis/availability/availability.api';

// 전체 누적 데이터 조회
export const useTotalAvailability = (roomId: number) => {
  return useQuery<TotalAvailabilityResponse>({
    queryKey: availabilityKeys.total(roomId),
    queryFn: async () => {
      const result = await getTotalAvailability({ roomId });
      if (result === null) throw new Error('전체 누적 데이터 조회 실패');
      return result;
    },
    enabled: !!roomId,
  });
};

// 내 일정 조회
export const useMyAvailability = (roomUserId: number) => {
  return useQuery<MyAvailabilityResponse>({
    queryKey: availabilityKeys.my(roomUserId),
    queryFn: async () => {
      const result = await getMyAvailability({ roomUserId });
      if (result === null) throw new Error('내 일정 조회 실패');
      return result;
    },
    enabled: !!roomUserId,
  });
};

// 특정 시간대가 가능한 사용자 조회
export const useConfirmedUsers = (roomId: number, date: string, slot: number) => {
  return useQuery<ConfirmedUsersResponse>({
    queryKey: availabilityKeys.confirmedUsers(roomId, date, slot),
    queryFn: async () => {
      const result = await getConfirmedUsers({ roomId, date, slot });
      if (result === null) throw new Error('가능한 사용자 조회 실패');
      return result;
    },
    enabled: !!roomId && !!date && slot !== undefined,
  });
};

// 특정 날짜가 가능한 사용자 조회
export const useDateConfirmedUsers = (roomId: number, date: string) => {
  return useQuery<ConfirmedUsersResponse>({
    queryKey: availabilityKeys.dateConfirmedUsers(roomId, date),
    queryFn: async () => {
      const result = await getDateConfirmedUsers(roomId, date);
      if (result === null) throw new Error('특정 날짜가 가능한 사용자 조회 실패');
      return result;
    },
    enabled: !!roomId && !!date,
  });
};

// 추천 시간대 조회
export const useRecommendTime = (roomId: number) => {
  return useQuery<RecommendTimeResponse>({
    queryKey: availabilityKeys.recommendTime(roomId),
    queryFn: async () => {
      const result = await getRecommendTime(roomId);
      if (result === null) throw new Error('추천 시간대 조회 실패');
      return result;
    },
    enabled: !!roomId,
  });
};
