import RoomLayout from '../components/layout/roomNav/RoomLayout';
import Calendar from '../features/calendar/components/Calendar';
import ConfirmedAppointment from './../features/appointment/ConfirmedAppointment';

const SchedulePage = () => {
  return (
    <RoomLayout>
      <div className="p-5">
        <ConfirmedAppointment />
        <Calendar />
      </div>
    </RoomLayout>
  );
};

export default SchedulePage;
