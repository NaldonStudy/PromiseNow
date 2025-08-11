import RoomLayout from '../../components/layout/RoomLayout';
import LeaveRoom from '../../features/settings/components/LeaveRoom';
import Notification from '../../features/settings/components/Notification';
import ProfileEdit from '../../features/settings/components/ProfileEdit';

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
