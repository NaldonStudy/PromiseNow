import Profile from './Profile';

interface Props {
  name: string;
  profileImg?: string | null;
  isPino?: boolean;
  iconSize?: number;
  textcolor?: string;
  className?: string;
}

const ProfileName = ({
  name,
  profileImg,
  isPino,
  iconSize = 14,
  textcolor = 'text-black',
  className = 'text-sm',
}: Props) => {
  return (
    <div className="flex items-center gap-2">
      <Profile width="w-5" imgUrl={profileImg} iconSize={iconSize} isPino={isPino} />
      <span className={`${className} ${textcolor}`}>{name}</span>
    </div>
  );
};

export default ProfileName;
