import type { ButtonHTMLAttributes } from 'react';
import type { IconType } from '../../types/icons.type';
import Icon from './Icon';

// 원형 버튼은 아이콘만 들어갈 수 있도록 함

// 사용할 색 조합별로 미리 정의
type BtnColor = 'primary' | 'point' | 'white';

const colorStyles: Record<BtnColor, { bg: string; icon: string; hover: string }> = {
  primary: { bg: 'bg-primary', icon: 'text-white', hover: 'hover:bg-primary-hover' },
  point: { bg: 'bg-point', icon: 'text-white', hover: 'hover:bg-point-hover' },
  white: { bg: 'bg-white', icon: 'text-primary', hover: 'hover:bg-gray' },
};

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  iconType: IconType;
  color: BtnColor;
  iconSize?: number;
}

const CircleBtn = ({
  iconType,
  iconSize = 24,
  color = 'primary',
  className = '',
  ...rest
}: Props): React.ReactElement => {
  const { bg, icon, hover } = colorStyles[color];

  return (
    <button
      type="button"
      className={`rounded-full p-3 focus:outline-none ${bg} ${
        color === 'white' ? 'drop-shadow-md' : ''
      } transition-colors duration-200 ${hover} ${className}`}
      {...rest}
    >
      <Icon type={iconType} size={iconSize} color={icon} />
    </button>
  );
};

export default CircleBtn;
