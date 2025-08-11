import ImgEdit from './ImgEdit';
import NameEdit from './NameEdit';

interface Props {
  nickname?: string;
  onNicknameUpdate: (nickname: string) => void;
}

const ProfileEdit = ({ nickname, onNicknameUpdate }: Props) => {
  return (
    <div className="flex items-center gap-8 px-5 py-5 border-b border-gray-dark">
      <ImgEdit />
      <div>
        <NameEdit nickname={nickname ?? '이름없음'} onUpdate={onNicknameUpdate} />
      </div>
    </div>
  );
};

export default ProfileEdit;
