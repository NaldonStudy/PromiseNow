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
  useRecommendTime,
} from '../hooks/queries/availability';
import {
  useAppointment,
  useRoomDateRange,
  useUpdateAppointment,
  useUpdateRoomDateRange,
  useRoomUserInfo,
  useUsersInRoom,
} from '../hooks/queries/room';
import { useUserStore } from '../stores/user.store';
import { useTitle } from '../hooks/common/useTitle';

import RequireAuth from '../components/RequireAuth';
import ScheduleTemplate from './templates/ScheduleTemplate';

const SchedulePage = () => {
  useTitle('일정 - PromiseNow');

  const { id } = useParams<{ id: string }>();
  const roomId = Number(id);
  const { user } = useUserStore();
  const roomUserId = useRoomUserInfo(roomId, user?.userId || 0).data?.roomUserId;

  const { setUserSelections } = useCalendarStore();

  const { invalidateRoom } = useInvalidateAvailabilityQueries();

  const { data: usersInRoom } = useUsersInRoom(roomId);
  const totalMembers = usersInRoom?.length || 0;

  const { data: totalAvailabilityData } = useTotalAvailability(roomId);
  const { data: roomDateRangeData } = useRoomDateRange(roomId);
  const { data: appointmentData } = useAppointment(roomId);
  const { data: myAvailabilityData } = useMyAvailability(roomUserId ?? -1);
  const { data: recommendTimeData } = useRecommendTime(roomId);
  const updateAppointmentMutation = useUpdateAppointment(roomId);
  const updateRoomDateRangeMutation = useUpdateRoomDateRange(roomId);
  const updateUserSelectionsMutation = useUpdateAvailability(roomId, roomUserId ?? -1);

  // userSelections 조회
  const convertMyAvailabilityToUserSelections = (myAvailabilityData: MyAvailabilityResponse) => {
    const userSelections: Record<string, boolean[]> = {};
    console.log('=== DEBUG: convertMyAvailabilityToUserSelections ===');
    console.log('myAvailabilityData:', myAvailabilityData);
    
    // 날짜 형식을 yyyy-MM-dd로 통일하는 함수
    const normalizeDate = (dateStr: string) => {
      try {
        // 이미 yyyy-MM-dd 형식인지 확인
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
          return dateStr;
        }
        
        // 다른 형식들을 yyyy-MM-dd로 변환
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) {
          console.warn('Invalid date format:', dateStr);
          return dateStr;
        }
        return date.toISOString().split('T')[0];
      } catch (error) {
        console.warn('Error normalizing date:', dateStr, error);
        return dateStr;
      }
    };
    
    myAvailabilityData.availabilities.forEach((availability) => {
      const { date, timeData } = availability;
      console.log('date from backend:', date, 'type:', typeof date);
      const normalizedDate = normalizeDate(date);
      console.log('normalized date:', normalizedDate);
      userSelections[normalizedDate] = timeData.split('').map((bit) => bit === '1');
    });
    console.log('converted userSelections keys:', Object.keys(userSelections));
    console.log('================================================');
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

    // 날짜 형식을 yyyy-MM-dd로 통일하는 함수
    const normalizeDate = (dateStr: string) => {
      try {
        // 이미 yyyy-MM-dd 형식인지 확인
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
          return dateStr;
        }
        
        // 다른 형식들을 yyyy-MM-dd로 변환
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) {
          console.warn('Invalid date format:', dateStr);
          return dateStr;
        }
        return date.toISOString().split('T')[0];
      } catch (error) {
        console.warn('Error normalizing date:', dateStr, error);
        return dateStr;
      }
    };

    const updatedDataList = Object.entries(userSelections).map(([date, timeArray]) => ({
      date: normalizeDate(date),
      timeData: timeArray.map((selected) => (selected ? '1' : '0')).join(''),
    }));
    const updateData = {
      roomUserId: roomUserId,
      updatedDataList,
    };
    
    console.log('=== DEBUG: handleUserSelectionsUpdate ===');
    console.log('Original userSelections keys:', Object.keys(userSelections));
    console.log('Normalized updatedDataList:', updatedDataList);
    console.log('========================================');
    
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
        totalMembers={totalMembers}
        appointmentData={appointmentData}
        dateRangeData={roomDateRangeData}
        totalAvailabilityData={totalAvailabilityData}
        recommendTimeData={recommendTimeData}
        onAppointmentUpdate={handleAppointmentUpdate}
        onDateRangeUpdate={handleDateRangeUpdate}
        onUserSelectionsUpdate={handleUserSelectionsUpdate}
        onRefreshCalendar={handleInvalidateRoom}
      />
    </RequireAuth>
  );
};

export default SchedulePage;
