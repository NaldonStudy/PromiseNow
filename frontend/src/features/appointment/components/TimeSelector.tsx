interface TimeSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const TimeSelector = ({ value, onChange }: TimeSelectorProps) => {
  return (
    <div className="flex items-center">
      <label className="w-15 block text-text-dark">시간</label>
      <input
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 bg-gray border border-gray-dark rounded-lg"
      />
    </div>
  );
};

export default TimeSelector;
