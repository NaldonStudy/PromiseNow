import { useMutation } from '@tanstack/react-query';
import {
  updateAvailability,
  updateOneAvailability,
} from '../../../apis/availability/availability.api';
import type {
  UpdateAvailabilityRequest,
  UpdateOneAvailabilityRequest,
} from '../../../apis/availability/availability.types';
import { useInvalidateAvailabilityQueries } from './keys';

// 전체 시간대 업데이트
export const useUpdateAvailability = (roomId: number) => {
  const { invalidateRoom } = useInvalidateAvailabilityQueries();

  return useMutation({
    mutationFn: (request: UpdateAvailabilityRequest) => updateAvailability(request),

    onSuccess: (_, variables) => {
      invalidateRoom(roomId, variables.roomUserId);
    },
  });
};

// 하나 시간대 업데이트
export const useUpdateOneAvailability = (roomId: number) => {
  const { invalidateRoom } = useInvalidateAvailabilityQueries();

  return useMutation({
    mutationFn: (request: UpdateOneAvailabilityRequest) => updateOneAvailability(request),

    onSuccess: (_, variables) => {
      invalidateRoom(roomId, variables.roomUserId);
    },
  });
};
