import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  className?: string;
}

const PopCard = ({ children, className = '' }: Props): React.ReactElement => {
  return (
    <div
      className={`absolute right-0 top-full mt-2 w-30 px-3 py-3 rounded-md border border-gray-dark bg-white shadow-md p=4 z-50 ${className} `}
    >
      {children}
    </div>
  );
};

export default PopCard;
