import { Link, useLocation } from 'react-router-dom';
import { useCallActionStore } from '../../../features/callScreen/callAction';

import Icon from '../../ui/Icon';

interface Props {
  link: string;
}

const RoomNavCall = ({ link }: Props) => {
  const location = useLocation();
  const isCallPage = location.pathname.endsWith('/call');
  const triggerLeave = useCallActionStore((s) => s.triggerLeave);

  const handleClick = (e: React.MouseEvent) => {
    if (isCallPage) {
      e.preventDefault();
      triggerLeave();
    }
  };

  return isCallPage ? (
    <Link
      to={link}
      onClick={handleClick}
      className="w-16 h-16 rounded-full flex items-center justify-center text-3xl bg-white border-primary border-2 text-primary hover:bg-primary transition-colors duration-200 hover:text-white"
    >
      <Icon type={'callOff'} color="primary" size={30} />
    </Link>
  ) : (
    <Link
      to={link}
      className="w-16 h-16 rounded-full flex items-center justify-center text-3xl bg-primary text-white"
    >
      <Icon type={'call'} color="white" size={30} />
    </Link>
  );
};

export default RoomNavCall;
