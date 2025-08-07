import RoomLayout from '../../components/layout/RoomLayout';
import LeaveRoom from '../../features/settings/LeaveRoom';
import ProfileEdit from '../../features/settings/ProfileEdit';
import Notification from '../../features/settings/Notification';

const SettingTemplate = () => {
  return (
    <RoomLayout>
      <ProfileEdit />
      <Notification />
      <LeaveRoom />
    </RoomLayout>
  );
};

export default SettingTemplate;
