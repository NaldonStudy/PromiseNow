import { useCalendarStore } from '../calendar.store';
import type { TotalAvailabilityResponse } from '../../../apis/availability/availability.types';
import type { DateRangeResponse, DateRangeUpdateRequest } from '../../../apis/room/room.types';
import { useUsersInRoom } from '../../../hooks/queries/room';

import DateRangeSelector from './DateRangeSelector';
import CalendarHeader from './CalendarHeader';
import MonthlyCalendar from './MonthlyCalendar';
import WeeklyCalendar from './WeeklyCalendar';
import ScheduleEditBtn from './ScheduleEditBtn';
import Card from '../../../components/ui/Card';
import { useParams } from 'react-router-dom';

interface CalendarProps {
  dateRangeData?: DateRangeResponse;
  totalAvailabilityData?: TotalAvailabilityResponse;
  onDateRangeUpdate: (dateRangeData: DateRangeUpdateRequest) => void;
  onUserSelectionsUpdate: (userSelections: Record<string, boolean[]>) => void;
  onRefreshCalendar: () => void;
}

const Calendar = ({
  dateRangeData,
  totalAvailabilityData,
  onDateRangeUpdate,
  onUserSelectionsUpdate,
  onRefreshCalendar,
}: CalendarProps) => {
  const { view, mode, currentDate } = useCalendarStore();
  const { id } = useParams();

  const { data: usersInRoom } = useUsersInRoom(Number(id));
  const totalMembers = usersInRoom?.length || 0;

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
            totalMembers={totalMembers}
            mode={mode}
          />
        ) : (
          <WeeklyCalendar
            dateRange={dateRangeData}
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
