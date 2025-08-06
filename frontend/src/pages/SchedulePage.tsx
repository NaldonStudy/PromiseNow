import { useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { useTotalAvailability } from '../hooks/queries/availability';
import {
  useAppointment,
  useRoomDateRange,
  useUpdateAppointment,
  useUpdateRoomDateRange,
} from '../hooks/queries/room';
import { useRoomStore } from '../stores/room.store';
import ScheduleTemplate from './templates/ScheduleTemplate';
import type { AppointmentUpdateRequest, DateRangeUpdateRequest } from '../apis/room/room.types';

const SchedulePage = () => {
  const { id } = useParams<{ id: string }>();
  const roomId = Number(id);
  const { setDateRange } = useRoomStore();

  const { data: totalAvailabilityData } = useTotalAvailability(roomId);
  const { data: roomDateRangeData } = useRoomDateRange(roomId);
  const { data: appointmentData } = useAppointment(roomId);
  const updateAppointmentMutation = useUpdateAppointment(roomId);
  const updateRoomDateRangeMutation = useUpdateRoomDateRange(roomId);

  useEffect(() => {
    if (roomDateRangeData) {
      setDateRange({
        start: new Date(roomDateRangeData.startDate),
        end: new Date(roomDateRangeData.endDate),
      });
    }
  }, [roomDateRangeData, setDateRange]);

  const handleAppointmentUpdate = (appointmentData: AppointmentUpdateRequest) => {
    updateAppointmentMutation.mutate(appointmentData, {
      onSuccess: () => {
        console.log('약속 업데이트', appointmentData);
      },
      onError: (error) => {
        console.error('약속 업데이트 실패:', error);
      },
    });
  };

  const handleDateRangeUpdate = (dateRangeData: DateRangeUpdateRequest) => {
    updateRoomDateRangeMutation.mutate(dateRangeData, {
      onSuccess: () => {
        console.log('기간 업데이트', dateRangeData);
      },
      onError: (error) => {
        console.error('기간 업데이트 실패:', error);
      },
    });
  };

  return (
    <ScheduleTemplate
      appointmentData={appointmentData}
      totalAvailabilityData={totalAvailabilityData}
      onAppointmentUpdate={handleAppointmentUpdate}
      onDateRangeUpdate={handleDateRangeUpdate}
    />
  );
};

export default SchedulePage;
