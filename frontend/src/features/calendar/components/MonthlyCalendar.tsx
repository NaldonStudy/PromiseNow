import { useMemo } from 'react';
import {
  format,
  addDays,
  startOfMonth,
  startOfWeek,
  isSameMonth,
  isBefore,
  isAfter,
} from 'date-fns';
import { getOpacityForMonth } from '../calendar.util';
import { useCalendarStore } from '../calendar.store';

interface Props {
  mode: 'view' | 'edit';
  currentDate: Date;
  totalDatas: Record<string, { timeData: string }>;
  totalMembers: number;
}

const MonthlyCalendar = ({ mode, totalDatas, currentDate, totalMembers }: Props) => {
  const { startDate, endDate, setCurrentDate, setView } = useCalendarStore();
  const currentMonth = startOfMonth(currentDate);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 0 });
    const end = addDays(
      startOfWeek(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0), {
        weekStartsOn: 0,
      }),
      6,
    );
    const total = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    return Array.from({ length: total }, (_, i) => addDays(start, i));
  }, [currentMonth]);

  const isDisabled = (day: Date) => {
    return isBefore(day, startDate) || isAfter(day, endDate);
  };

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-7 gap-1">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <div key={`${d}-${i}`} className="text-center text-xs">
            {d}
          </div>
        ))}

        {days.map((day) => {
          const key = format(day, 'yyyy-MM-dd');
          const count = totalDatas[key]?.timeData
            ? [...totalDatas[key].timeData].reduce((acc, v) => acc + Number(v), 0)
            : 0;

          const isOutOfRange = isDisabled(day);
          const isCurrentMonth = isSameMonth(day, currentMonth);

          return (
            <div
              key={key}
              onClick={() => {
                if (mode === 'edit' && !isOutOfRange) {
                  setCurrentDate(day);
                  setView('week');
                }
              }}
              className={`aspect-square rounded-md p-2 text-center text-sm cursor-pointer justify-center flex items-center
                ${
                  isOutOfRange
                    ? 'bg-gray-dark text-text-dark pointer-events-none'
                    : getOpacityForMonth(count, totalMembers)
                }
                ${isCurrentMonth ? '' : 'opacity-10'}
              `}
            >
              {format(day, 'd')}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MonthlyCalendar;
