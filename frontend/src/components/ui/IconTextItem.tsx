import type { IconType } from '../../types/icons.type';
import Icon from './Icon';

interface Props {
  type: IconType;
  text: string;
  textColor: string;
  iconColor: string;
  iconSize?: number;
  textSize?: string;
}

const IconTextItem = ({
  type,
  text,
  textColor,
  iconColor,
  iconSize = 24,
  textSize = 'text-sm',
}:Props): React.ReactElement => {
  return (
    <div className="flex items-center gap-2">
      <Icon type={type} size={iconSize} color={iconColor} />
      <span className={`font-bold ${textSize} ${textColor} px-1.5 py-1`}>{text}</span>
    </div>
  );
};

export default IconTextItem;
