import { Link, useLocation } from 'react-router-dom';
import type { IconType } from '../../../types/icons.type';
import Icon from '../../ui/Icon';

interface Props {
  type: IconType;
  text: string;
  link: string;
}

const NavItem = ({ type, text, link }: Props): React.ReactElement => {
  const location = useLocation();
  const isActive = location.pathname === link;

  return (
    <Link
      to={link}
      className="flex flex-col items-center justify-center gap-0.5 p-2 min-w-[60px] rounded-full hover:bg-gray-50 transition-colors"
    >
      <Icon type={type} size={22} color={isActive ? 'text-primary' : 'text-text-dark'} />
      <span className={`text-xs ${isActive ? 'text-primary' : 'text-text-dark'}`}>{text}</span>
    </Link>
  );
};

export default NavItem;
