import RoomLayout from '../components/layout/RoomLayout';
import Calendar from '../features/calendar/components/Calendar';

const SchedulePage = () => {
  return (
    <RoomLayout>
      <div className="p-5">
        <Calendar />
      </div>
    </RoomLayout>
  );
};

export default SchedulePage;
