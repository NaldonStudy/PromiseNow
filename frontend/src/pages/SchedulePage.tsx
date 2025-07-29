import RoomLayout from '../components/layout/RoomLayout';
import Calendar from '../features/calendar/components/Calendar';
import ScheduleRecommendation from '../features/scheduleRecommendation/components/ScheduleRecommendation';

const SchedulePage = () => {
  return (
    <RoomLayout>
      <div className="p-5">
        <Calendar />
        <ScheduleRecommendation />
      </div>
    </RoomLayout>
  );
};

export default SchedulePage;
