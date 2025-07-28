import type { ButtonHTMLAttributes } from 'react';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  text: string;
  template: 'filled' | 'outlined';
  width?: string;
  height?: string;
  textSize?: string;
}

// 기본 둥근네모, 애니메이션 설정하기
const baseStyle = 'rounded-md border font-medium focus:outline-none transition-colors duration-200';

// 두 가지 버전으로 테두리, 배경색 나누기
const styleMap = {
  filled: 'bg-primary text-white border-transparent hover:bg-primary-hover',
  outlined: 'bg-white text-primary border-primary hover:bg-gray-100',
};

const SquareBtn = ({
  text,
  width = 'w-10',
  height = 'h-10',
  textSize = 'text-sm',
  template = 'filled',
  className = '',
  ...rest
}: Props): React.ReactElement => {
  return (
    <button
      type="button"
      className={`${width} ${height} ${textSize} ${baseStyle} ${styleMap[template]} ${className}`}
      {...rest}
    >
      {text}
    </button>
  );
};

export default SquareBtn;
