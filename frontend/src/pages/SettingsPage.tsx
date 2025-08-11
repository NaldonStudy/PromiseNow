import { useParams } from 'react-router-dom';
import { useTitle } from '../hooks/common/useTitle';
import { useRoomUserInfo, useUpdateNickname } from '../hooks/queries/room';
import { useUserStore } from '../stores/user.store';

import RequireAuth from '../components/RequireAuth';
import SettingTemplate from './templates/SettingTemplate';

const SettingsPage = () => {
  useTitle('설정 - PromiseNow');

  const { id } = useParams<{ id: string }>();
  const roomId = Number(id);
  const userId = useUserStore((state) => state.userId);

  const nicknameData = useRoomUserInfo(roomId, userId).data?.nickname;
  const updateNicknameMutation = useUpdateNickname(userId, roomId);

  const handleNicknameUpdate = (nickname: string) => {
    updateNicknameMutation.mutate({
      nickname: nickname,
    });
  };

  return (
    <RequireAuth>
      <SettingTemplate nicknameData={nicknameData} onNicknameUpdate={handleNicknameUpdate} />
    </RequireAuth>
  );
};

export default SettingsPage;
