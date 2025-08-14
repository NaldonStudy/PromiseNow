import axiosInstance from '../../lib/axiosInstance';
import handleApi from '../../lib/handleApi';
import type {
  ConfirmedUsersResponse,
  GetConfirmedUsersRequest,
  GetMyAvailabilityRequest,
  GetTotalAvailabilityRequest,
  MyAvailabilityResponse,
  RecommendTimeResponse,
  TotalAvailabilityResponse,
  UpdateAvailabilityRequest,
  UpdateOneAvailabilityRequest,
} from './availability.types';

// 전체 시간대 업데이트
export const updateAvailability = async (request: UpdateAvailabilityRequest) => {
  const data = await handleApi<void>(axiosInstance.put('/availability/batch-update', request));
  return data;
};

// 하나 시간대 업데이트
export const updateOneAvailability = async (request: UpdateOneAvailabilityRequest) => {
  const data = await handleApi<void>(
    axiosInstance.post('/availability/save', null, {
      params: request,
    }),
  );
  return data;
};

// 전체 누적 데이터 조회
export const getTotalAvailability = async (request: GetTotalAvailabilityRequest) => {
  const data = await handleApi<TotalAvailabilityResponse>(
    axiosInstance.get('/availability/total', {
      params: request,
    }),
  );
  return data;
};

// 내 일정 조회
export const getMyAvailability = async (request: GetMyAvailabilityRequest) => {
  const data = await handleApi<MyAvailabilityResponse>(
    axiosInstance.get('/availability/me', {
      params: request,
    }),
  );
  return data;
};

// 특정 시간대가 가능한 사용자 조회
export const getConfirmedUsers = async (request: GetConfirmedUsersRequest) => {
  const data = await handleApi<ConfirmedUsersResponse>(
    axiosInstance.get('/availability/confirmed-users', {
      params: request,
    }),
  );
  return data;
};

// 특정 날짜가 가능한 사용자 조회
export const getDateConfirmedUsers = async (roomId: number, date: string) => {
  const data = await handleApi<ConfirmedUsersResponse>(
    axiosInstance.get('/availability/confirmed-users-by-date', {
      params: { roomId, date },
    }),
  );
  return data;
};

// 추천 시간 조회
export const getRecommendTime = async (roomId: number) => {
  const data = await handleApi<RecommendTimeResponse>(
    axiosInstance.get('/availability/recommend-time', {
      params: { roomId },
    }),
  );
  return data;
};
