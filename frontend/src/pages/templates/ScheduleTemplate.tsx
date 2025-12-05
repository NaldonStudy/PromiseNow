import RoomLayout from '../../components/layout/RoomLayout';
import ConfirmedAppointment from '../../features/appointment/ConfirmedAppointment';
import Calendar from '../../features/calendar/components/Calendar';
import ScheduleRecommendation from '../../features/scheduleRecommendation/components/ScheduleRecommendation';
import type {
  RecommendTimeResponse,
  TotalAvailabilityResponse,
} from '../../apis/availability/availability.types';
import type {
  AppointmentResponse,
  AppointmentUpdateRequest,
  DateRangeResponse,
  DateRangeUpdateRequest,
} from '../../apis/room/room.types';

interface ScheduleTemplateProps {
  totalMembers?: number;
  dateRangeData?: DateRangeResponse;
  appointmentData?: AppointmentResponse;
  totalAvailabilityData?: TotalAvailabilityResponse;
  recommendTimeData?: RecommendTimeResponse;
  onAppointmentUpdate: (appointmentData: AppointmentUpdateRequest) => void;
  onDateRangeUpdate: (dateRangeData: DateRangeUpdateRequest) => void;
  onUserSelectionsUpdate: (userSelections: Record<string, boolean[]>) => void;
  onRefreshCalendar: () => void;
}

const ScheduleTemplate = ({
  totalMembers,
  appointmentData,
  dateRangeData,
  totalAvailabilityData,
  recommendTimeData,
  onAppointmentUpdate,
  onDateRangeUpdate,
  onUserSelectionsUpdate,
  onRefreshCalendar,
}: ScheduleTemplateProps) => {
  return (
    <RoomLayout>
      <div className="p-5">
        <ConfirmedAppointment
          dateRangeData={dateRangeData}
          appointmentData={appointmentData}
          onAppointmentUpdate={onAppointmentUpdate}
        />
        <Calendar
          totalMembers={totalMembers}
          dateRangeData={dateRangeData}
          totalAvailabilityData={totalAvailabilityData}
          onDateRangeUpdate={onDateRangeUpdate}
          onUserSelectionsUpdate={onUserSelectionsUpdate}
          onRefreshCalendar={onRefreshCalendar}
        />
        <ScheduleRecommendation totalMembers={totalMembers} recommendTimeData={recommendTimeData} />
      </div>
    </RoomLayout>
  );
};

export default ScheduleTemplate;
