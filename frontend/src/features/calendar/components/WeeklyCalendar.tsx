import { Fragment, useMemo, useState } from 'react';
import { getOpacityForWeek } from '../calendar.util';
import { format, addDays } from 'date-fns';
import { useCalendarStore } from '../calendar.store';

interface Props {
  mode: 'view' | 'edit';
  currentDate: Date;
  totalDatas: Record<string, { timeData: string }>;
  totalMembers: number;
}

const WeeklyCalendar = ({ mode, currentDate, totalDatas, totalMembers }: Props) => {
  const { startDate, endDate, userSelections, setUserSelections } = useCalendarStore();

  const days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      return format(addDays(currentDate, i), 'yyyy-MM-dd');
    });
  }, [currentDate]);

  const [dragStart, setDragStart] = useState<{ day: string; index: number } | null>(null);
  const [dragEnd, setDragEnd] = useState<{ day: string; index: number } | null>(null);
  const [dragAction, setDragAction] = useState<'select' | 'deselect'>('select');

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
        updated[day] = [...updated[day]];
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

  return (
    <div
      className="grid grid-cols-[auto_repeat(7,minmax(0,1fr))] select-none"
      onMouseUp={() => {
        if (dragStart && dragEnd) applyDragSelection(dragStart, dragEnd, dragAction);
        setDragStart(null);
        setDragEnd(null);
      }}
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
              const inRange =
                startDate && endDate
                  ? new Date(date) >= startDate && new Date(date) <= endDate
                  : true;

              const isValid = inRange;
              const hasData = !!totalDatas[date];
              const count = hasData ? Number(totalDatas[date].timeData?.[idx] ?? 0) : 0;
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
