import RoomLayout from '../../components/layout/RoomLayout';
import ConfirmedAppointment from '../../features/appointment/ConfirmedAppointment';
import Calendar from '../../features/calendar/components/Calendar';
import ScheduleRecommendation from '../../features/scheduleRecommendation/components/ScheduleRecommendation';
import type { TotalAvailabilityResponse } from '../../apis/availability/availability.types';

interface ScheduleTemplateProps {
  totalAvailabilityData?: TotalAvailabilityResponse;
}

const ScheduleTemplate = ({ totalAvailabilityData }: ScheduleTemplateProps) => {
  return (
    <RoomLayout>
      <div className="p-5">
        <ConfirmedAppointment />
        <Calendar totalAvailabilityData={totalAvailabilityData} />
        <ScheduleRecommendation />
      </div>
    </RoomLayout>
  );
};

export default ScheduleTemplate;
