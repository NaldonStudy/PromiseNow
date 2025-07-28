import Icon from './Icon';

interface Props {
  size: number;
  iconSize?: number;
  imgUrl?: string;
  className?: string;
}

const Profile = ({ size, imgUrl, className = '', iconSize = 20 }: Props): React.ReactElement => {
  return (
    <div
      className={`rounded-full w-${size} h-${size} bg-white flex items-center justify-center drop-shadow-md overflow-hidden ${className}`}
    >
      {imgUrl ? (
        <img src={imgUrl} alt="프로필" className="w-full h-full object-cover" />
      ) : (
        <Icon type="person" size={iconSize} color="text-primary" />
      )}
    </div>
  );
};

export default Profile;
