import React from 'react';

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  textSize?: string;
}
const baseStyle =
  'w-full px-4 py-2 rounded-md bg-gray-input border border-gray-dark focus:outline-none';

const Input = React.forwardRef<HTMLInputElement, Props>(({ className, textSize, ...rest }, ref) => {
  return <input ref={ref} className={`${baseStyle} ${textSize} ${className}`} {...rest} />;
});

Input.displayName = 'Input';

export default Input;
