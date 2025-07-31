import Card from '../../../components/ui/Card';
import { useCalendarStore } from '../calendar.store';

const DateRangeSelector = () => {
  const { startDate, endDate, setStartDate, setEndDate, setCurrentDate } = useCalendarStore();

  return (
    <Card className="p-5">
      <h2 className="font-bold mb-3 text-sm">약속 예정 기간</h2>
      <div className="flex flex-wrap items-center gap-2 justify-start">
        <div>
          <input
            className="border border-gray-dark rounded-md px-3 py-2 text-xs w-[130px] "
            type="date"
            onChange={(e) => {
              setStartDate(new Date(e.target.value));
              setCurrentDate(new Date(e.target.value));
            }}
            value={startDate ? startDate.toISOString().split('T')[0] : ''}
          />
        </div>
        <span className="mx-1">~</span>
        <div>
          <input
            className="border border-gray-dark rounded-md px-3 py-2 text-xs w-[130px] "
            type="date"
            onChange={(e) => setEndDate(new Date(e.target.value))}
            value={endDate ? endDate.toISOString().split('T')[0] : ''}
          />
        </div>
      </div>
    </Card>
  );
};

export default DateRangeSelector;
