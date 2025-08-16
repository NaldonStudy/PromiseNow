import Icon from '../../../components/ui/Icon';
import Profile from '../../../components/ui/Profile';

interface Props {
  imgUrl?: string | null;
  className?: string;
  color?: string;
  isMyMarker?: boolean;
}

const UserMarker = ({ imgUrl, className = '', color = 'text-primary' }: Props) => {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
        <Icon type={'marker'} color={color} size={55} />
      </div>
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <Profile imgUrl={imgUrl} width="w-[30px]" />
      </div>
    </div>
  );
};

export default UserMarker;
