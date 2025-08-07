import RoomLayout from '../../components/layout/RoomLayout';
import ConfirmedAppointment from '../../features/appointment/ConfirmedAppointment';
import Calendar from '../../features/calendar/components/Calendar';
import ScheduleRecommendation from '../../features/scheduleRecommendation/components/ScheduleRecommendation';
import type { TotalAvailabilityResponse } from '../../apis/availability/availability.types';
import type { AppointmentUpdateRequest, DateRangeUpdateRequest } from '../../apis/room/room.types';

interface ScheduleTemplateProps {
  appointmentData?: AppointmentUpdateRequest;
  totalAvailabilityData?: TotalAvailabilityResponse;
  onAppointmentUpdate: (appointmentData: AppointmentUpdateRequest) => void;
  onDateRangeUpdate: (dateRangeData: DateRangeUpdateRequest) => void;
  onUserSelectionsUpdate: (userSelections: Record<string, boolean[]>) => void;
}

const ScheduleTemplate = ({
  appointmentData,
  totalAvailabilityData,
  onAppointmentUpdate,
  onDateRangeUpdate,
  onUserSelectionsUpdate,
}: ScheduleTemplateProps) => {
  return (
    <RoomLayout>
      <div className="p-5">
        <ConfirmedAppointment
          appointmentData={appointmentData}
          onAppointmentUpdate={onAppointmentUpdate}
        />
        <Calendar
          totalAvailabilityData={totalAvailabilityData}
          onDateRangeUpdate={onDateRangeUpdate}
          onUserSelectionsUpdate={onUserSelectionsUpdate}
        />
        <ScheduleRecommendation />
      </div>
    </RoomLayout>
  );
};

export default ScheduleTemplate;
