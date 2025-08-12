import { useParams } from 'react-router-dom';
import { useTitle } from '../hooks/common/useTitle';
import { useRoomUserInfo, useUpdateNickname, useUpdateProfileImage } from '../hooks/queries/room';
import { useUserStore } from '../stores/user.store';

import RequireAuth from '../components/RequireAuth';
import SettingTemplate from './templates/SettingTemplate';

const SettingsPage = () => {
  useTitle('설정 - PromiseNow');

  const { id } = useParams<{ id: string }>();
  const roomId = Number(id);
  const { user } = useUserStore();

  const { data: roomUserInfo } = useRoomUserInfo(roomId, user?.userId || 0);
  const nicknameData = roomUserInfo?.nickname;
  const profileImageUrl = roomUserInfo?.profileImage;
  const updateNicknameMutation = useUpdateNickname(user?.userId || 0, roomId);
  const updateProfileImageMutation = useUpdateProfileImage(user?.userId || 0, roomId);

  const handleNicknameUpdate = (nickname: string) => {
    updateNicknameMutation.mutate({
      nickname: nickname,
    });
  };

  const handleProfileImageUpdate = async (file: File) => {
    updateProfileImageMutation.mutate({
      file,
    });
  };

  return (
    <RequireAuth>
      <SettingTemplate
        nicknameData={nicknameData}
        onNicknameUpdate={handleNicknameUpdate}
        profileImageUrl={profileImageUrl}
        onProfileImageUpdate={handleProfileImageUpdate}
      />
    </RequireAuth>
  );
};

export default SettingsPage;
