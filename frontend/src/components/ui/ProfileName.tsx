import Profile from './Profile';

interface Props {
  name: string;
  profileImg: string | null;
}

const ProfileName = ({ name, profileImg }: Props) => {
  return (
    <div className="flex items-center gap-2">
      <Profile width="w-5" imgUrl={profileImg} iconSize={14} />
      <span className="text-sm text-black">{name}</span>
    </div>
  );
};

export default ProfileName;
