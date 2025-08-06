import { useParams } from 'react-router-dom';
import { useState } from 'react';
import { useTotalAvailability } from '../hooks/queries/availability';
import { useUpdateAppointment } from '../hooks/queries/room';
import ScheduleTemplate from './templates/ScheduleTemplate';
import type { AppointmentUpdateRequest } from '../apis/room/room.types';

const SchedulePage = () => {
  const { id } = useParams<{ id: string }>();
  const roomId = Number(id);

  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);

  const { data: totalAvailabilityData } = useTotalAvailability(roomId);
  const updateAppointmentMutation = useUpdateAppointment(roomId);

  const handleAppointmentEdit = () => {
    setIsAppointmentModalOpen(true);
  };

  const handleAppointmentUpdate = (appointmentData: AppointmentUpdateRequest) => {
    updateAppointmentMutation.mutate(appointmentData, {
      onSuccess: () => {
        setIsAppointmentModalOpen(false);
        // 성공 처리 (예: 토스트 메시지)
      },
      onError: (error) => {
        console.error('약속 업데이트 실패:', error);
        // 에러 처리 (예: 에러 토스트)
      },
    });
  };

  const handleAppointmentModalClose = () => {
    setIsAppointmentModalOpen(false);
  };

  return (
    <ScheduleTemplate
      totalAvailabilityData={totalAvailabilityData}
      isAppointmentModalOpen={isAppointmentModalOpen}
      onAppointmentEdit={handleAppointmentEdit}
      onAppointmentUpdate={handleAppointmentUpdate}
      onAppointmentModalClose={handleAppointmentModalClose}
      isUpdating={updateAppointmentMutation.isPending}
    />
  );
};

export default SchedulePage;
