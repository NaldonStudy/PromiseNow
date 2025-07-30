import RoomLayout from '../components/layout/RoomLayout';
import Calendar from '../features/calendar/components/Calendar';
import ScheduleRecommendation from '../features/scheduleRecommendation/components/ScheduleRecommendation';
import ConfirmedAppointment from './../features/appointment/ConfirmedAppointment';

const SchedulePage = () => {
  return (
    <RoomLayout>
      <div className="p-5">
        <ConfirmedAppointment />
        <Calendar />
        <ScheduleRecommendation />
      </div>
    </RoomLayout>
  );
};

export default SchedulePage;
