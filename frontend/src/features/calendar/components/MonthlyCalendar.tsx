import { useMemo, useState } from 'react';
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
import type { DateRangeResponse } from '../../../apis/room/room.types';
import { useParams } from 'react-router-dom';
import { useDateConfirmedUsers } from '../../../hooks/queries';

import UsersPopCard from './UsersPopCard';

interface Props {
  mode: 'view' | 'edit';
  dateRange?: DateRangeResponse;
  currentDate: Date;
  totalDatas?: TotalAvailabilityResponse;
  totalMembers: number;
}

const MonthlyCalendar = ({ mode, totalDatas, currentDate, totalMembers, dateRange }: Props) => {
  const { setCurrentDate, setView } = useCalendarStore();
  const currentMonth = startOfMonth(currentDate);

  const { id } = useParams<{ id: string }>();
  const roomId = Number(id);

  const [popCard, setPopCard] = useState<{
    open: boolean;
    anchor: { x: number; y: number };
    date: string;
  } | null>(null);

  const { data: confirmedUsersData } = useDateConfirmedUsers(roomId, popCard?.date ?? '');
  const confirmedUsers = confirmedUsersData?.confirmedUserList;

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
    const today = startOfDay(new Date());
    const start = dateRange?.startDate ? startOfDay(new Date(dateRange.startDate)) : today;
    const end = dateRange?.endDate ? startOfDay(new Date(dateRange.endDate)) : today;

    const dayStart = startOfDay(day);

    return isBefore(dayStart, start) || isAfter(dayStart, end);
  };

  const getDateData = (date: string) => {
    return totalDatas?.totalDatas?.find((item) => item.date === date);
  };

  return (
    <>
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
              ? Math.max(...dateData.timeData.split('').map(Number))
              : 0;

            const isOutOfRange = isDisabled(day);
            const isCurrentMonth = isSameMonth(day, currentMonth);

            // 주간 캘린더처럼 클릭 위치에 PopCard 띄우기
            const handleCellClick = (e: React.MouseEvent) => {
              if (mode === 'edit' && !isOutOfRange) {
                setCurrentDate(day);
                setView('week');
              } else if (mode === 'view' && !isOutOfRange && count > 0) {
                setPopCard({
                  open: true,
                  anchor: { x: e.clientX, y: e.clientY },
                  date: key,
                });
              }
            };

            return (
              <div
                key={key}
                onClick={handleCellClick}
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
      {popCard && popCard.open && (confirmedUsers?.length ?? 0) > 0 && (
        <UsersPopCard
          users={confirmedUsers ?? []}
          onClose={() => setPopCard(null)}
          anchor={popCard.anchor}
        />
      )}
    </>
  );
};

export default MonthlyCalendar;
