import { useState } from 'react';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { useCalendarStore } from '../calendar.store';

import Icon from '../../../components/ui/Icon';
import SquareBtn from '../../../components/ui/SquareBtn';

interface Props {
  onRefreshCalendar: () => void;
}

const CalendarHeader = ({ onRefreshCalendar }: Props) => {
  const { view, currentDate, setView, moveWeek, moveMonth } = useCalendarStore();
  const [rotating, setRotating] = useState(false);

  const handlePrev = () => (view === 'month' ? moveMonth(-1) : moveWeek(-1));
  const handleNext = () => (view === 'month' ? moveMonth(1) : moveWeek(1));

  const handleRefresh = () => {
    setRotating(true);
    onRefreshCalendar();
    setTimeout(() => setRotating(false), 700); // 0.7초 후 회전 해제
  };

  const getDateText = () => {
    if (view === 'month') {
      return format(currentDate, 'yyyy년 M월');
    }

    const start = startOfWeek(currentDate, { weekStartsOn: 0 });
    const startDate = format(start, 'M월 dd일');

    const end = endOfWeek(currentDate, { weekStartsOn: 0 });
    const endDate = format(end, 'M월 dd일');

    return `${startDate} - ${endDate}`;
  };

  return (
    <div className="flex justify-between items-center">
      <div className="flex gap-3 items-center">
        <button onClick={handlePrev}>
          <Icon type="left" color="text-text-dark" size={15} />
        </button>
        <span className="font-bold text-sm">{getDateText()}</span>
        <button onClick={handleNext}>
          <Icon type="right" color="text-text-dark" size={15} />
        </button>
      </div>

      <div className="flex gap-1 justify-center items-center">
        <SquareBtn
          text={'월'}
          template={view === 'month' ? 'filled' : 'outlined'}
          width="w-7"
          height="h-7"
          textSize="text-xs"
          onClick={() => setView('month')}
        />
        <SquareBtn
          text={'주'}
          template={view === 'week' ? 'filled' : 'outlined'}
          width="w-7"
          height="h-7"
          textSize="text-xs"
          onClick={() => setView('week')}
        />
        <span className={rotating ? 'animate-spin' : ''} style={{ display: 'inline-flex' }}>
          <Icon type="repeat" color="text-text-dark" size={18} onClick={handleRefresh} />
        </span>
      </div>
    </div>
  );
};

export default CalendarHeader;
