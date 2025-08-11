import ImgEdit from './ImgEdit';
import NameEdit from './NameEdit';

interface Props {
  nickname?: string;
  onNicknameUpdate: (nickname: string) => void;
  profileImageUrl?: string | null;
  onProfileImageUpdate: (file: File) => void;
}

const ProfileEdit = ({
  nickname,
  onNicknameUpdate,
  profileImageUrl,
  onProfileImageUpdate,
}: Props) => {
  return (
    <div className="flex items-center gap-8 px-5 py-5 border-b border-gray-dark">
      <ImgEdit imageUrl={profileImageUrl} onImageUpdate={onProfileImageUpdate} />
      <div>
        <NameEdit nickname={nickname ?? '이름없음'} onUpdate={onNicknameUpdate} />
      </div>
    </div>
  );
};

export default ProfileEdit;
