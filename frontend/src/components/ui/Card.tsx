import type { ReactNode } from 'react';

interface Props {
  className?: string;
  children?: ReactNode;
}

const baseStyle = 'w-full rounded-md bg-white border border-gray-dark';

const Card = ({ className = '', children }: Props): React.ReactElement => {
  return <div className={`${baseStyle} ${className}`}>{children}</div>;
};

export default Card;
