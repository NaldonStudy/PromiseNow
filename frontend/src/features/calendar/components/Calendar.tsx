import { useCalendarStore } from '../calendar.store';
import type { TotalAvailabilityResponse } from '../../../apis/availability/availability.types';
import type { DateRangeUpdateRequest } from '../../../apis/room/room.types';

import DateRangeSelector from './DateRangeSelector';
import CalendarHeader from './CalendarHeader';
import MonthlyCalendar from './MonthlyCalendar';
import WeeklyCalendar from './WeeklyCalendar';
import ScheduleEditBtn from './ScheduleEditBtn';
import Card from '../../../components/ui/Card';

interface CalendarProps {
  totalAvailabilityData?: TotalAvailabilityResponse;
  onDateRangeUpdate: (dateRangeData: DateRangeUpdateRequest) => void;
  onUserSelectionsUpdate: (userSelections: Record<string, boolean[]>) => void;
}

const Calendar = ({
  totalAvailabilityData,
  onDateRangeUpdate,
  onUserSelectionsUpdate,
}: CalendarProps) => {
  const { view, mode, currentDate } = useCalendarStore();
  const totalMembers = 5; //임시

  return (
    <>
      <div className="mb-5">
        <DateRangeSelector onDateRangeUpdate={onDateRangeUpdate} />
      </div>

      <Card className="flex flex-col gap-5 p-5">
        <CalendarHeader />

        {view === 'month' ? (
          <MonthlyCalendar
            totalDatas={totalAvailabilityData}
            currentDate={currentDate}
            totalMembers={totalMembers}
            mode={mode}
          />
        ) : (
          <WeeklyCalendar
            currentDate={currentDate}
            totalDatas={totalAvailabilityData}
            totalMembers={totalMembers}
            mode={mode}
          />
        )}
        <ScheduleEditBtn onUserSelectionsUpdate={onUserSelectionsUpdate} />
      </Card>
    </>
  );
};

export default Calendar;
