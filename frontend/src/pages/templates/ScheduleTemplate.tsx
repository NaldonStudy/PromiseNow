import RoomLayout from '../../components/layout/RoomLayout';
import ConfirmedAppointment from '../../features/appointment/components/ConfirmedAppointment';
import Calendar from '../../features/calendar/components/Calendar';
import ScheduleRecommendation from '../../features/scheduleRecommendation/components/ScheduleRecommendation';
import type { TotalAvailabilityResponse } from '../../apis/availability/availability.types';
import type { AppointmentUpdateRequest } from '../../apis/room/room.types';

interface ScheduleTemplateProps {
  totalAvailabilityData?: TotalAvailabilityResponse;
  isAppointmentModalOpen: boolean;
  onAppointmentEdit: () => void;
  onAppointmentUpdate: (appointmentData: AppointmentUpdateRequest) => void;
  onAppointmentModalClose: () => void;
  isUpdating: boolean;
}

const ScheduleTemplate = ({
  totalAvailabilityData,
  isAppointmentModalOpen,
  onAppointmentEdit,
  onAppointmentUpdate,
  onAppointmentModalClose,
  isUpdating,
}: ScheduleTemplateProps) => {
  return (
    <RoomLayout>
      <div className="p-5">
        <ConfirmedAppointment
          onEdit={onAppointmentEdit}
          isModalOpen={isAppointmentModalOpen}
          onModalClose={onAppointmentModalClose}
          onAppointmentUpdate={onAppointmentUpdate}
          isUpdating={isUpdating}
        />
        <Calendar totalAvailabilityData={totalAvailabilityData} />
        <ScheduleRecommendation />
      </div>
    </RoomLayout>
  );
};

export default ScheduleTemplate;
