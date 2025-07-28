import type { IconType } from '../../types/icons.type';
import { iconMap } from '../../types/icons.type';

interface Props {
  type: IconType;
  size?: number;
  color?: string;
}

const Icon = ({ type, size = 24, color = 'text-primary' }: Props): React.ReactElement => {
  const IconComponent = iconMap[type];

  return <IconComponent className={color} style={{ width: size, height: size }} />;
};

export default Icon;
