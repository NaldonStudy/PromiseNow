import { useCalendarStore } from '../calendar.store';
import type { TotalAvailabilityResponse } from '../../../apis/availability/availability.types';

import DateRangeSelector from './DateRangeSelector';
import CalendarHeader from './CalendarHeader';
import MonthlyCalendar from './MonthlyCalendar';
import WeeklyCalendar from './WeeklyCalendar';
import ScheduleEditBtn from './ScheduleEditBtn';
import Card from '../../../components/ui/Card';

interface CalendarProps {
  totalAvailabilityData?: TotalAvailabilityResponse;
}

const Calendar = ({ totalAvailabilityData }: CalendarProps) => {
  const { view, mode, currentDate } = useCalendarStore();
  const totalMembers = 5; //임시

  return (
    <>
      <div className="mb-5">
        <DateRangeSelector />
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
        <ScheduleEditBtn />
      </Card>
    </>
  );
};

export default Calendar;
