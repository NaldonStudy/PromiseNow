import RoomLayout from '../components/layout/RoomLayout';
import LeaveRoom from './../features/settings/LeaveRoom';
import Notification from './../features/settings/Notification';
import ProfileEdit from './../features/settings/ProfileEdit';

const SettingsPage = () => {
  return (
    <RoomLayout>
      <ProfileEdit />
      <Notification />
      <LeaveRoom />
    </RoomLayout>
  );
};

export default SettingsPage;
