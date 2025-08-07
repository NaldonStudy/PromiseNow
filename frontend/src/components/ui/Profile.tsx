import Icon from './Icon';

interface Props {
  width: string;
  iconSize?: number;
  imgUrl?: string | null;
  className?: string;
  isPino?: boolean;
}

const Profile = ({
  width,
  imgUrl,
  className = '',
  iconSize = 20,
  isPino = false,
}: Props): React.ReactElement => {
  return (
    <div
      className={`rounded-full ${width} ${
        isPino ? 'bg-point' : 'bg-white'
      } aspect-square flex items-center justify-center drop-shadow-md overflow-hidden ${className}`}
    >
      {isPino ? (
        <Icon type="bot" size={iconSize} color="text-white" /> // ✅ 피노 전용 아이콘
      ) : imgUrl ? (
        <img src={imgUrl} alt="프로필" className="w-full h-full object-cover" />
      ) : (
        <Icon type="person" size={iconSize} color="text-primary" />
      )}
    </div>
  );
};

export default Profile;
