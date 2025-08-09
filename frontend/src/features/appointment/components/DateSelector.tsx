import { useRoomStore } from '../../../stores/room.store';

interface DateSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const DateSelector = ({ value, onChange }: DateSelectorProps) => {
  const { dateRange } = useRoomStore();

  // dateRange가 있으면 해당 범위로 min, max 설정
  const getDateLimits = () => {
    if (!dateRange) return {};

    const formatDate = (date: Date) => {
      return date.toISOString().split('T')[0]; // YYYY-MM-DD 형식
    };

    return {
      min: formatDate(dateRange.start),
      max: formatDate(dateRange.end),
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
