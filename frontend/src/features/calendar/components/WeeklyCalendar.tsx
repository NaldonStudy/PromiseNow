import { Fragment, useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { getOpacityForWeek } from '../calendar.util';
import { format, addDays, startOfWeek, startOfDay, isBefore, isAfter } from 'date-fns';
import { useCalendarStore } from '../calendar.store';
import type { TotalAvailabilityResponse } from '../../../apis/availability/availability.types';
import { useRoomStore } from '../../../stores/room.store';

interface Props {
  mode: 'view' | 'edit';
  currentDate: Date;
  totalDatas?: TotalAvailabilityResponse;
  totalMembers: number;
}

const WeeklyCalendar = ({ mode, currentDate, totalDatas, totalMembers }: Props) => {
  const { userSelections, setUserSelections } = useCalendarStore();
  const { dateRange } = useRoomStore();
  const containerRef = useRef<HTMLDivElement>(null);

  const days = useMemo(() => {
    const startOfWeekDate = startOfWeek(currentDate, { weekStartsOn: 0 }); // 0: Sunday
    return Array.from({ length: 7 }, (_, i) => {
      return format(addDays(startOfWeekDate, i), 'yyyy-MM-dd');
    });
  }, [currentDate]);

  const [dragStart, setDragStart] = useState<{ day: string; index: number } | null>(null);
  const [dragEnd, setDragEnd] = useState<{ day: string; index: number } | null>(null);
  const [dragAction, setDragAction] = useState<'select' | 'deselect'>('select');

  const getDateData = (date: string) => {
    return totalDatas?.totalDatas?.find((item) => item.date === date);
  };

  const applyDragSelection = (
    start: { day: string; index: number },
    end: { day: string; index: number },
    action: 'select' | 'deselect',
  ) => {
    const startDayIdx = days.indexOf(start.day);
    const endDayIdx = days.indexOf(end.day);
    const minDayIdx = Math.min(startDayIdx, endDayIdx);
    const maxDayIdx = Math.max(startDayIdx, endDayIdx);
    const minIdx = Math.min(start.index, end.index);
    const maxIdx = Math.max(start.index, end.index);

    setUserSelections((prev) => {
      const updated = { ...prev };
      for (let d = minDayIdx; d <= maxDayIdx; d++) {
        const day = days[d];
        if (!Array.isArray(updated[day])) {
          updated[day] = new Array(30).fill(false);
        } else {
          updated[day] = [...updated[day]];
        }
        for (let i = minIdx; i <= maxIdx; i++) {
          updated[day][i] = action === 'select';
        }
      }
      return updated;
    });
  };

  const isInDragRange = (date: string, idx: number) => {
    if (!dragStart || !dragEnd) return false;
    const startDayIdx = days.indexOf(dragStart.day);
    const endDayIdx = days.indexOf(dragEnd.day);
    const minDayIdx = Math.min(startDayIdx, endDayIdx);
    const maxDayIdx = Math.max(startDayIdx, endDayIdx);
    const minIdx = Math.min(dragStart.index, dragEnd.index);
    const maxIdx = Math.max(dragStart.index, dragEnd.index);
    const currentDayIdx = days.indexOf(date);
    return (
      currentDayIdx >= minDayIdx && currentDayIdx <= maxDayIdx && idx >= minIdx && idx <= maxIdx
    );
  };

  const handleDragEnd = () => {
    if (dragStart && dragEnd) {
      applyDragSelection(dragStart, dragEnd, dragAction);
    }
    setDragStart(null);
    setDragEnd(null);
  };

  // 날짜 범위 검증 함수 개선
  const isDateInRange = useCallback(
    (dateString: string) => {
      if (!dateRange?.start || !dateRange?.end) return false;

      const date = startOfDay(new Date(dateString));
      const start = startOfDay(new Date(dateRange.start));
      const end = startOfDay(new Date(dateRange.end));

      return !isBefore(date, start) && !isAfter(date, end);
    },
    [dateRange],
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouchMoveNative = (event: TouchEvent) => {
      if (mode === 'edit' && dragStart) {
        event.preventDefault(); // 화면 스크롤 방지

        const touch = event.touches[0];
        const target = document.elementFromPoint(touch.clientX, touch.clientY) as HTMLElement;

        if (target && target.dataset.date && target.dataset.index) {
          const date = target.dataset.date;
          const idx = parseInt(target.dataset.index);

          if (isDateInRange(date)) {
            setDragEnd({ day: date, index: idx });
          }
        }
      }
    };

    const handleTouchStartNative = (event: TouchEvent) => {
      const target = event.target as HTMLElement;
      if (mode === 'edit' && target.dataset.date && target.dataset.index) {
        event.preventDefault(); // 터치 스크롤 방지

        const date = target.dataset.date;
        const idx = parseInt(target.dataset.index);

        if (isDateInRange(date)) {
          const selected = userSelections[date]?.[idx] ?? false;
          setDragStart({ day: date, index: idx });
          setDragEnd({ day: date, index: idx });
          setDragAction(selected ? 'deselect' : 'select');
        }
      }
    };

    container.addEventListener('touchmove', handleTouchMoveNative, { passive: false });
    container.addEventListener('touchstart', handleTouchStartNative, { passive: false });

    return () => {
      container.removeEventListener('touchmove', handleTouchMoveNative);
      container.removeEventListener('touchstart', handleTouchStartNative);
    };
  }, [mode, dragStart, dateRange, setDragEnd, userSelections, isDateInRange]);

  return (
    <div
      ref={containerRef}
      className="grid grid-cols-[auto_repeat(7,minmax(0,1fr))] select-none"
      onMouseUp={handleDragEnd}
      onTouchEnd={handleDragEnd}
    >
      <div />
      {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
        <div key={`${d}-${i}`} className="text-center text-xs">
          {d}
        </div>
      ))}

      {Array.from({ length: 30 }, (_, idx) => {
        const label = idx % 2 === 0 ? `${String(8 + Math.floor(idx / 2)).padStart(2, '0')}` : '';
        return (
          <Fragment key={idx}>
            <div className="text-xs text-right pr-1 select-none pointer-events-none">{label}</div>
            {days.map((date) => {
              const isValid = isDateInRange(date);

              const dateData = getDateData(date);
              const hasData = !!dateData;
              const count = hasData ? Number(dateData.timeData?.[idx] ?? 0) : 0;
              const selected = userSelections[date]?.[idx] ?? false;
              const isDrag = isInDragRange(date, idx);

              const bg = !isValid
                ? 'bg-gray-200'
                : isDrag
                ? 'bg-point/50'
                : mode === 'edit' && selected
                ? 'bg-point'
                : getOpacityForWeek(count, totalMembers);

              return (
                <div
                  key={date + idx}
                  className={`h-5 border ${bg} ${
                    isValid ? 'cursor-pointer' : 'pointer-events-none'
                  }`}
                  style={{ borderColor: 'rgba(209, 213, 219, 0.5)' }}
                  data-date={date}
                  data-index={idx}
                  onMouseDown={() => {
                    if (mode === 'edit' && isValid) {
                      setDragStart({ day: date, index: idx });
                      setDragEnd({ day: date, index: idx });
                      setDragAction(selected ? 'deselect' : 'select');
                    }
                  }}
                  onMouseEnter={() => {
                    if (mode === 'edit' && dragStart && isValid) {
                      setDragEnd({ day: date, index: idx });
                    }
                  }}
                />
              );
            })}
          </Fragment>
        );
      })}
    </div>
  );
};

export default WeeklyCalendar;
