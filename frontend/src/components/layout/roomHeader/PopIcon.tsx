import { useState } from 'react';
import type { IconType } from '../../../types/icons.type';
import Icon from './../../ui/Icon';
import PopCard from './../../ui/PopCard';

interface Props {
  iconType: IconType;
  iconSize?: number;
  iconColor?: string;
  children: React.ReactNode;
}

const PopIcon = ({
  iconType,
  iconSize = 18,
  iconColor = 'text-dark',
  children,
}: Props): React.ReactElement => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <Icon
        type={iconType}
        size={iconSize}
        color={iconColor}
        onClick={() => setOpen((prev) => !prev)}
      />
      {open && (
        <div className="absolute right-0 top-full mt-2 z-50 bg-white rounded-md border border-gray-dark">
          <PopCard>{children}</PopCard>
        </div>
      )}
    </div>
  );
};

export default PopIcon;
