import { FiPhoneCall } from 'react-icons/fi';
import { Link } from 'react-router-dom';

interface Props {
  link: string;
}

const RoomNavCall = ({ link }: Props) => {
  return (
    <Link
      to={link}
      className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white text-3xl"
    >
      <FiPhoneCall />
    </Link>
  );
};

export default RoomNavCall;
