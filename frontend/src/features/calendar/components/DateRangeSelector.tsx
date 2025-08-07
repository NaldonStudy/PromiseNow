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

  const startDate = dateRange?.start ? new Date(dateRange.start) : null;
  const endDate = dateRange?.end ? new Date(dateRange.end) : null;

  const isUnsetDate = (date: Date | null) => !date || date.getFullYear() === 1970;

  const formatDate = (date: Date | null) => (date ? date.toISOString().split('T')[0] : '');

  const formatDisplayDate = (date: Date | null) =>
    isUnsetDate(date) ? '미설정' : formatDate(date);

  const handleEdit = () => {
    setIsEditing(true);
    setTempStartDate(isUnsetDate(startDate) ? '' : formatDate(startDate));
    setTempEndDate(isUnsetDate(endDate) ? '' : formatDate(endDate));
  };

  const handleConfirm = () => {
    const today = new Date().toISOString().split('T')[0];

    const start = tempStartDate || today;
    const end = tempEndDate || today;

    if (new Date(start) > new Date(end)) return;

    const dateRangeData: DateRangeUpdateRequest = {
      startDate: start,
      endDate: end,
    };

    onDateRangeUpdate(dateRangeData);

    setDateRange({
      start: new Date(start),
      end: new Date(end),
    });

    setCurrentDate(new Date(start));
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
              {formatDisplayDate(startDate)}
            </div>
            <span className="flex-shrink-0 text-xs">~</span>
            <div className="flex-1 px-3 py-2 text-xs bg-gray rounded-md text-center">
              {formatDisplayDate(endDate)}
            </div>
          </div>
          <SquareBtn
            onClick={handleEdit}
            text={'기간 수정하기'}
            template={'outlined'}
            width="w-full"
          />
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-1 sm:gap-2">
            <input
              className="border border-gray-dark rounded-md px-3 py-2 text-xs flex-1 min-w-0"
              type="date"
              value={tempStartDate}
              placeholder="미설정"
              onChange={(e) => setTempStartDate(e.target.value)}
              max={tempEndDate || undefined}
            />
            <span className="flex-shrink-0 text-xs">~</span>
            <input
              className="border border-gray-dark rounded-md px-3 py-2 text-xs flex-1 min-w-0"
              type="date"
              value={tempEndDate}
              placeholder="미설정"
              onChange={(e) => setTempEndDate(e.target.value)}
              min={tempStartDate || undefined}
            />
          </div>
          <div className="flex gap-2">
            <SquareBtn onClick={handleCancel} text={'취소'} template={'outlined'} width="w-full" />
            <SquareBtn onClick={handleConfirm} text={'저장'} template={'filled'} width="w-full" />
          </div>
        </div>
      )}
    </Card>
  );
};

export default DateRangeSelector;
