import { useRoomStore } from '../../../stores/room.store';
import ImgEdit from './ImgEdit';
import NameEdit from './NameEdit';

const ProfileEdit = () => {
  const { nickname, setNickname } = useRoomStore();

  return (
    <div className="flex items-center gap-8 px-5 py-5 border-b border-gray-dark">
      <ImgEdit />
      <div>
        <NameEdit name={nickname ?? '이름없음'} onUpdate={setNickname} />
      </div>
    </div>
  );
};

export default ProfileEdit;
