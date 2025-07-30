import Icon from './Icon';

interface Props {
  width: string;
  iconSize?: number;
  imgUrl?: string| null ;
  className?: string;
}

const Profile = ({ width, imgUrl, className = '', iconSize = 20 }: Props): React.ReactElement => {
  return (
    <div
      className={`rounded-full ${width} bg-white aspect-square flex items-center justify-center drop-shadow-md overflow-hidden ${className}`}
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
