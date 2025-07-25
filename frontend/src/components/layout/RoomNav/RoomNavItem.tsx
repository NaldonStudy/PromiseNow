import { Link } from 'react-router-dom';

interface Props {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  link: string;
}

const RoomNavItem = ({ label, icon: Icon, link }: Props) => {
  return (
    <Link to={link} className="flex flex-col items-center text-xs text-text-dark">
      <Icon className="text-xl mb-1" />
      <span>{label}</span>
    </Link>
  );
};

export default RoomNavItem;
