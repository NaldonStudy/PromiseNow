import { useState } from 'react';
import Card from '../../../components/ui/Card';
import { useRoomStore } from '../../../stores/room.store';
import { useCalendarStore } from '../calendar.store';
import SquareBtn from '../../../components/ui/SquareBtn';

const DateRangeSelector = () => {
  const { dateRange, setDateRange } = useRoomStore();
  const { setCurrentDate } = useCalendarStore();

  // 임시 상태 관리
  const [isEditing, setIsEditing] = useState(false);
  const [tempStartDate, setTempStartDate] = useState<string>('');
  const [tempEndDate, setTempEndDate] = useState<string>('');

  const startDate = dateRange?.start ? new Date(dateRange.start) : null;
  const endDate = dateRange?.end ? new Date(dateRange.end) : null;

  // 수정 모드 시작
  const handleEdit = () => {
    setIsEditing(true);
    setTempStartDate(startDate ? startDate.toISOString().split('T')[0] : '');
    setTempEndDate(endDate ? endDate.toISOString().split('T')[0] : '');
  };

  // 확인 (저장)
  const handleConfirm = () => {
    if (tempStartDate && tempEndDate) {
      const newStartDate = new Date(tempStartDate);
      const newEndDate = new Date(tempEndDate);

      setDateRange({
        start: newStartDate,
        end: newEndDate,
      });
      setCurrentDate(newStartDate);
    }
    setIsEditing(false);
  };

  // 취소
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
        // 보기 모드
        <div className="space-y-3">
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="flex-1 px-3 py-2 text-xs bg-gray rounded-md text-center">
              {startDate ? startDate.toISOString().split('T')[0] : '시작일 미설정'}
            </div>
            <span className="flex-shrink-0 text-xs">~</span>
            <div className="flex-1 px-3 py-2 text-xs bg-gray rounded-md text-center">
              {endDate ? endDate.toISOString().split('T')[0] : '종료일 미설정'}
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
        // 편집 모드
        <div className="space-y-3">
          <div className="flex items-center gap-1 sm:gap-2">
            <input
              className="border border-gray-dark rounded-md px-3 py-2 text-xs flex-1 min-w-0"
              type="date"
              value={tempStartDate}
              onChange={(e) => setTempStartDate(e.target.value)}
            />
            <span className="flex-shrink-0 text-xs">~</span>
            <input
              className="border border-gray-dark rounded-md px-3 py-2 text-xs flex-1 min-w-0"
              type="date"
              value={tempEndDate}
              onChange={(e) => setTempEndDate(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <SquareBtn onClick={handleCancel} text={'취소'} template={'outlined'} width="w-full" />
            <SquareBtn onClick={handleConfirm} text={'확인'} template={'filled'} width="w-full" />
          </div>
        </div>
      )}
    </Card>
  );
};

export default DateRangeSelector;
