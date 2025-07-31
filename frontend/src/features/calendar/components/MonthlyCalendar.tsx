import { useMemo } from 'react';
import {
  format,
  addDays,
  startOfMonth,
  startOfWeek,
  isSameMonth,
  isBefore,
  isAfter,
  startOfDay,
} from 'date-fns';
import { getOpacityForMonth } from '../calendar.util';
import { useCalendarStore } from '../calendar.store';
import type { TotalAvailabilityResponse } from '../../../apis/availability/availability.types';

interface Props {
  mode: 'view' | 'edit';
  currentDate: Date;
  totalDatas?: TotalAvailabilityResponse;
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
    if (!startDate || !endDate) return true;

    const dayStart = startOfDay(day);
    const start = startOfDay(startDate);
    const end = startOfDay(endDate);

    return isBefore(dayStart, start) || isAfter(dayStart, end);
  };

  const getDateData = (date: string) => {
    return totalDatas?.totalDatas?.find(item => item.date === date);
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
          const dateData = getDateData(key);
          const count = dateData?.timeData
            ? [...dateData.timeData].reduce((acc, v) => acc + Number(v), 0)
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
