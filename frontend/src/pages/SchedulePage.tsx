import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import type { MyAvailabilityResponse } from '../apis/availability/availability.types';
import type { AppointmentUpdateRequest, DateRangeUpdateRequest } from '../apis/room/room.types';
import { useCalendarStore } from '../features/calendar/calendar.store';
import {
  useMyAvailability,
  useTotalAvailability,
  useUpdateAvailability,
  useInvalidateAvailabilityQueries,
} from '../hooks/queries/availability';
import {
  useAppointment,
  useRoomDateRange,
  useUpdateAppointment,
  useUpdateRoomDateRange,
  useRoomUserInfo,
} from '../hooks/queries/room';
import { useUserStore } from '../stores/user.store';
import { useTitle } from '../hooks/common/useTitle';

import RequireAuth from '../components/RequireAuth';
import ScheduleTemplate from './templates/ScheduleTemplate';

const SchedulePage = () => {
  useTitle('일정 - PromiseNow');

  const { id } = useParams<{ id: string }>();
  const roomId = Number(id);
  const userId = useUserStore((state) => state.userId);
  const roomUserId = useRoomUserInfo(roomId, userId).data?.roomUserId;

  const { setUserSelections } = useCalendarStore();

  const { invalidateRoom } = useInvalidateAvailabilityQueries();

  const { data: totalAvailabilityData } = useTotalAvailability(roomId);
  const { data: roomDateRangeData } = useRoomDateRange(roomId);
  const { data: appointmentData } = useAppointment(roomId);
  const { data: myAvailabilityData } = useMyAvailability(roomId);
  const updateAppointmentMutation = useUpdateAppointment(roomId);
  const updateRoomDateRangeMutation = useUpdateRoomDateRange(roomId);
  const updateUserSelectionsMutation = useUpdateAvailability(roomId, roomUserId ?? -1);

  // userSelections 조회
  const convertMyAvailabilityToUserSelections = (myAvailabilityData: MyAvailabilityResponse) => {
    const userSelections: Record<string, boolean[]> = {};
    myAvailabilityData.availabilities.forEach((availability) => {
      const { date, timeData } = availability;
      userSelections[date] = timeData.split('').map((bit) => bit === '1');
    });
    return userSelections;
  };

  useEffect(() => {
    if (myAvailabilityData) {
      const convertedSelections = convertMyAvailabilityToUserSelections(myAvailabilityData);
      setUserSelections(() => convertedSelections);
    }
  }, [myAvailabilityData, setUserSelections]);

  const handleAppointmentUpdate = (appointmentData: AppointmentUpdateRequest) => {
    updateAppointmentMutation.mutate(appointmentData, {
      onSuccess: () => {
        console.log('약속 업데이트', appointmentData);
      },
      onError: (error) => {
        console.error('약속 업데이트 실패:', error);
      },
    });
  };

  const handleDateRangeUpdate = (dateRangeData: DateRangeUpdateRequest) => {
    updateRoomDateRangeMutation.mutate(dateRangeData, {
      onSuccess: () => {
        console.log('기간 업데이트', dateRangeData);
      },
      onError: (error) => {
        console.error('기간 업데이트 실패:', error);
      },
    });
  };

  const handleUserSelectionsUpdate = (userSelections: Record<string, boolean[]>) => {
    if (roomUserId === undefined) return;

    const updatedDataList = Object.entries(userSelections).map(([date, timeArray]) => ({
      date,
      timeData: timeArray.map((selected) => (selected ? '1' : '0')).join(''),
    }));
    const updateData = {
      roomUserId: roomUserId,
      updatedDataList,
    };
    updateUserSelectionsMutation.mutate(updateData, {
      onSuccess: () => {
        console.log('사용자 선택 업데이트', updateData);
      },
      onError: (error) => {
        console.error('사용자 선택 업데이트 실패:', error);
      },
    });
  };

  const handleInvalidateRoom = () => {
    if (roomUserId === undefined) return;
    invalidateRoom(roomId, roomUserId);
  };

  return (
    <RequireAuth>
      <ScheduleTemplate
        appointmentData={appointmentData}
        dateRangeData={roomDateRangeData}
        totalAvailabilityData={totalAvailabilityData}
        onAppointmentUpdate={handleAppointmentUpdate}
        onDateRangeUpdate={handleDateRangeUpdate}
        onUserSelectionsUpdate={handleUserSelectionsUpdate}
        onRefreshCalendar={handleInvalidateRoom}
      />
    </RequireAuth>
  );
};

export default SchedulePage;
