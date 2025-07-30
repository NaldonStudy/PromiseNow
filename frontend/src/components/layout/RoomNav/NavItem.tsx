import { Link } from 'react-router-dom';
import type { IconType } from '../../../types/icons.type';
import Icon from '../../ui/Icon';

interface Props {
  type: IconType;
  text: string;
  link: string;
}

const NavItem = ({ type, text, link }: Props): React.ReactElement => {
  return (
    <Link to={link} className="flex flex-col items-center justify-center gap-0.5">
      <Icon type={type} size={22} color="text-text-dark" />
      <span className="text-xs text-text-dark">{text}</span>
    </Link>
  );
};

export default NavItem;
