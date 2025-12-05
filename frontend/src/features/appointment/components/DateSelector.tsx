import type { DateRangeResponse } from '../../../apis/room/room.types';

interface DateSelectorProps {
  value: string;
  onChange: (value: string) => void;
  dateRange?: DateRangeResponse;
}

const DateSelector = ({ value, onChange, dateRange }: DateSelectorProps) => {
  const getDateLimits = () => {
    if (!dateRange) return {};
    return {
      min: dateRange?.startDate,
      max: dateRange?.endDate,
    };
  };

  const dateLimits = getDateLimits();

  return (
    <div className="flex items-center">
      <label className="w-15 block text-text-dark">날짜</label>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 bg-gray border border-gray-dark rounded-lg"
        {...dateLimits}
      />
    </div>
  );
};

export default DateSelector;
