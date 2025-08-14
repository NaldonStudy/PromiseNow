import RoomLayout from '../../components/layout/RoomLayout';
import LeaveRoom from '../../features/settings/components/LeaveRoom';
import Notification from '../../features/settings/components/Notification';
import ProfileEdit from '../../features/settings/components/ProfileEdit';

interface Props {
  nicknameData?: string;
  onNicknameUpdate: (nickname: string) => void;
  profileImageUrl?: string | null;
  onProfileImageUpdate: (file: File) => void;
}

const SettingTemplate = ({
  nicknameData,
  onNicknameUpdate,
  profileImageUrl,
  onProfileImageUpdate,
}: Props) => {
  return (
    <RoomLayout>
      <ProfileEdit
        nickname={nicknameData}
        onNicknameUpdate={onNicknameUpdate}
        profileImageUrl={profileImageUrl}
        onProfileImageUpdate={onProfileImageUpdate}
      />
      <Notification />
      <LeaveRoom />
    </RoomLayout>
  );
};

export default SettingTemplate;
