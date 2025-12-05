import { useState } from 'react';

interface Props {
  isOn?: boolean;
  onToggle?: (checked: boolean) => void;
}

const ToggleBtn = ({ isOn = true, onToggle }: Props): React.ReactElement => {
  const [checked, setChecked] = useState(isOn);

  const handleToggle = () => {
    setChecked((prev) => {
      const newValue = !prev;
      onToggle?.(newValue); // 부모에 콜백 전달 (있으면)
      return newValue;
    });
  };
  return (
    <button
      onClick={handleToggle}
      className={`w-12 h-7 rounded-full transition-colors duration-300 focus:outline-none
        ${checked ? 'bg-primary' : 'bg-gray-dark'} relative`}
    >
      <div
        className={`w-6 h-6 bg-white rounded-full shadow-md absolute top-0.5 
          transition-transform duration-300 transform
          ${checked ? 'translate-x-5' : 'translate-x-0.5'}`}
      />
    </button>
  );
};

export default ToggleBtn;
