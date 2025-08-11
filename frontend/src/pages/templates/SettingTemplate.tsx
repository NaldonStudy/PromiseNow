import RoomLayout from '../../components/layout/RoomLayout';
import LeaveRoom from '../../features/settings/components/LeaveRoom';
import Notification from '../../features/settings/components/Notification';
import ProfileEdit from '../../features/settings/components/ProfileEdit';

interface Props {
  nicknameData?: string;
  onNicknameUpdate: (nickname: string) => void;
}

const SettingTemplate = ({ nicknameData, onNicknameUpdate }: Props) => {
  return (
    <RoomLayout>
      <ProfileEdit nickname={nicknameData} onNicknameUpdate={onNicknameUpdate} />
      <Notification />
      <LeaveRoom />
    </RoomLayout>
  );
};

export default SettingTemplate;
