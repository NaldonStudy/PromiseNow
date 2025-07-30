interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  textSize?: string;
}
const baseStyle =
  'w-full px-4 py-2 rounded-md bg-gray-input border border-gray-dark focus:outline-none';

const Input = ({ className, textSize, ...rest }: Props): React.ReactElement => {
  return <input className={`${baseStyle} ${textSize} ${className}`} {...rest} />;
};

export default Input;
