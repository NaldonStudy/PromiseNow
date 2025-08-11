import { useState } from 'react';
import type { DateRangeUpdateRequest } from '../../../apis/room/room.types';
import Card from '../../../components/ui/Card';
import SquareBtn from '../../../components/ui/SquareBtn';
import { useRoomStore } from '../../../stores/room.store';
import { useCalendarStore } from '../calendar.store';

interface DateRangeSelectorProps {
  onDateRangeUpdate: (dateRangeData: DateRangeUpdateRequest) => void;
}

const DateRangeSelector = ({ onDateRangeUpdate }: DateRangeSelectorProps) => {
  const { dateRange, setDateRange } = useRoomStore();
  const { setCurrentDate } = useCalendarStore();

  const [isEditing, setIsEditing] = useState(false);
  const [tempStartDate, setTempStartDate] = useState('');
  const [tempEndDate, setTempEndDate] = useState('');

  const today = new Date();

  const isValidDate = (date?: Date | null) => date instanceof Date && !isNaN(date.getTime());

  const startDate = isValidDate(dateRange?.start) ? dateRange!.start : today;
  const endDate = isValidDate(dateRange?.end) ? dateRange!.end : today;

  const formatDate = (date: Date) => date.toISOString().split('T')[0];

  const handleEdit = () => {
    setIsEditing(true);
    setTempStartDate(formatDate(startDate));
    setTempEndDate(formatDate(endDate));
  };

  const handleConfirm = () => {
    const todayStr = new Date().toISOString().split('T')[0];

    const safeStartDate =
      tempStartDate && tempStartDate !== '1970-01-01' ? tempStartDate : todayStr;
    const safeEndDate = tempEndDate && tempEndDate !== '1970-01-01' ? tempEndDate : todayStr;

    const dateRangeData: DateRangeUpdateRequest = {
      startDate: safeStartDate,
      endDate: safeEndDate,
    };

    onDateRangeUpdate(dateRangeData);

    const start = new Date(safeStartDate);
    const end = new Date(safeEndDate);

    setDateRange({ start, end });
    setCurrentDate(start);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setTempStartDate('');
    setTempEndDate('');
  };

  return (
    <Card className="p-5">
      <div className="flex justify-between items-center mb-3">
        <h2 className="font-bold text-sm">약속 예정 기간</h2>
      </div>

      {!isEditing ? (
        <div className="space-y-3">
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="flex-1 px-3 py-2 text-xs bg-gray rounded-md text-center">
              {formatDate(startDate)}
            </div>
            <span className="flex-shrink-0 text-xs">~</span>
            <div className="flex-1 px-3 py-2 text-xs bg-gray rounded-md text-center">
              {formatDate(endDate)}
            </div>
          </div>
          <SquareBtn onClick={handleEdit} text="기간 수정하기" template="outlined" width="w-full" />
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-1 sm:gap-2">
            <input
              className="border border-gray-dark rounded-md px-3 py-2 text-xs flex-1 min-w-0"
              type="date"
              value={tempStartDate}
              onChange={(e) => setTempStartDate(e.target.value)}
              max={tempEndDate || undefined}
            />
            <span className="flex-shrink-0 text-xs">~</span>
            <input
              className="border border-gray-dark rounded-md px-3 py-2 text-xs flex-1 min-w-0"
              type="date"
              value={tempEndDate}
              onChange={(e) => setTempEndDate(e.target.value)}
              min={tempStartDate || undefined}
            />
          </div>
          <div className="flex gap-2">
            <SquareBtn onClick={handleCancel} text="취소" template="outlined" width="w-full" />
            <SquareBtn onClick={handleConfirm} text="저장" template="filled" width="w-full" />
          </div>
        </div>
      )}
    </Card>
  );
};

export default DateRangeSelector;
