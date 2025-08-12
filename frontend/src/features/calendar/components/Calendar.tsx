import { useCalendarStore } from '../calendar.store';
import type { TotalAvailabilityResponse } from '../../../apis/availability/availability.types';
import type { DateRangeResponse, DateRangeUpdateRequest } from '../../../apis/room/room.types';

import DateRangeSelector from './DateRangeSelector';
import CalendarHeader from './CalendarHeader';
import MonthlyCalendar from './MonthlyCalendar';
import WeeklyCalendar from './WeeklyCalendar';
import ScheduleEditBtn from './ScheduleEditBtn';
import Card from '../../../components/ui/Card';

interface CalendarProps {
  totalMembers?: number;
  dateRangeData?: DateRangeResponse;
  totalAvailabilityData?: TotalAvailabilityResponse;
  onDateRangeUpdate: (dateRangeData: DateRangeUpdateRequest) => void;
  onUserSelectionsUpdate: (userSelections: Record<string, boolean[]>) => void;
  onRefreshCalendar: () => void;
}

const Calendar = ({
  totalMembers,
  dateRangeData,
  totalAvailabilityData,
  onDateRangeUpdate,
  onUserSelectionsUpdate,
  onRefreshCalendar,
}: CalendarProps) => {
  const { view, mode, currentDate } = useCalendarStore();

  return (
    <>
      <div className="mb-5">
        <DateRangeSelector dateRange={dateRangeData} onDateRangeUpdate={onDateRangeUpdate} />
      </div>

      <Card className="flex flex-col gap-5 p-5">
        <CalendarHeader onRefreshCalendar={onRefreshCalendar} />

        {view === 'month' ? (
          <MonthlyCalendar
            dateRange={dateRangeData}
            totalDatas={totalAvailabilityData}
            currentDate={currentDate}
            totalMembers={totalMembers ? totalMembers : 0}
            mode={mode}
          />
        ) : (
          <WeeklyCalendar
            dateRange={dateRangeData}
            currentDate={currentDate}
            totalDatas={totalAvailabilityData}
            totalMembers={totalMembers ? totalMembers : 0}
            mode={mode}
          />
        )}
        <ScheduleEditBtn onUserSelectionsUpdate={onUserSelectionsUpdate} />
      </Card>
    </>
  );
};

export default Calendar;
