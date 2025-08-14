import { useCallback, useEffect, useRef, useState } from 'react';
import { MdDragHandle } from 'react-icons/md';
import { useParams } from 'react-router-dom';
import { useAppointment, useUsersInRoom } from '../../../hooks/queries';
import { useLeaderboard } from '../../../hooks/queries/leaderboard';
import { useLeaderboardSocket } from '../../../hooks/socket/useLeaderboardSocket';
import useMapStore from '../../map/map.store';
import ArrivalRankingItem from './ArrivalRankingItem';

import type {
  ArrivalRankingItem as ArrivalRankingItemType,
  PositionResponseDto,
  UserJoinNotificationDto,
} from '../../../apis/leaderboard/leaderboard.types';

const MIN_HEIGHT = 150;
const MAX_HEIGHT = window.innerHeight * 0.7;

const ArrivalRanking = () => {
  const { id } = useParams<{ id: string }>();
  const parsedRoomId = parseInt(id || '', 10);

  const containerRef = useRef<HTMLDivElement>(null);
  const { rankingHeight, setRankingHeight } = useMapStore();

  const [positions, setPositions] = useState<PositionResponseDto[]>([]);
  const [rankingItems, setRankingItems] = useState<ArrivalRankingItemType[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);

  // 방 참가자 정보 조회
  const { data: users } = useUsersInRoom(parsedRoomId);

  // 약속 정보 조회
  const { data: appointmentData, isLoading: isLoadingAppointment } = useAppointment(parsedRoomId);

  // 초기 리더보드 데이터 조회
  const { data: initialLeaderboard, isLoading: isLoadingLeaderboard } =
    useLeaderboard(parsedRoomId);

  // 새로운 사용자 참가 알림 처리
  const handleUserJoin = useCallback(
    (notification: UserJoinNotificationDto) => {
      console.log('👋 새로운 사용자 참가:', notification);

      // 토스트 알림 표시 (선택사항)
      // toast.success(`${notification.nickname}님이 참가했습니다!`);

      // 리더보드 데이터 새로고침
      if (initialLeaderboard) {
        setPositions(initialLeaderboard);
      }
    },
    [initialLeaderboard],
  );

  // WebSocket 연결 - 실시간 데이터만 사용
  useLeaderboardSocket(
    parsedRoomId,
    (newPositions: PositionResponseDto[]) => {
      console.log('📡 WebSocket으로 받은 새로운 위치 데이터:', newPositions);
      console.log(
        '📊 온라인 상태 확인:',
        newPositions.map((p) => ({ roomUserId: p.roomUserId, online: p.online })),
      );

      // 이전 데이터와 비교하여 변경사항 확인
      setPositions((prevPositions) => {
        const hasChanges = JSON.stringify(prevPositions) !== JSON.stringify(newPositions);
        console.log('🔄 데이터 변경사항:', hasChanges ? '있음' : '없음');
        return newPositions;
      });

      // 업데이트 중 표시
      setIsUpdating(true);
      setTimeout(() => setIsUpdating(false), 1000);
    },
    handleUserJoin,
    appointmentData,
    isLoadingAppointment,
  );

  // 초기 데이터 설정 및 컴포넌트 마운트 시 상태 초기화
  useEffect(() => {
    console.log('🔄 ArrivalRanking 컴포넌트 마운트/업데이트:', { roomId: parsedRoomId });

    // 컴포넌트 마운트 시 상태 초기화
    setPositions([]);
    setRankingItems([]);
    setIsUpdating(false);

    if (initialLeaderboard && initialLeaderboard.length > 0) {
      console.log('📊 초기 리더보드 데이터 설정:', initialLeaderboard);
      setPositions(initialLeaderboard);
    }
  }, [initialLeaderboard, parsedRoomId]);

  // 위치 추적 시작 (MapView에서 처리하므로 여기서는 제거)
  // useEffect(() => {
  //   console.log('🔍 위치 추적 조건 확인:', {
  //     hasLocationLat: !!appointmentData?.locationLat,
  //     hasLocationLng: !!appointmentData?.locationLng,
  //     isClientConnected: !!client?.connected,
  //     appointmentData,
  //     client
  //   });

  //   if (!appointmentData?.locationLat || !appointmentData?.locationLng || !client?.connected) {
  //     console.log('⚠️ 위치 추적 조건 불만족');
  //     return;
  //   }

  //   console.log('✅ 위치 추적 시작');
  //   // 초기 위치 전송
  //   sendCurrentPosition();

  //   // 주기적으로 위치 전송 (30초마다)
  //   const interval = setInterval(sendCurrentPosition, 30000);

  //   return () => clearInterval(interval);
  // }, [appointmentData, client, sendCurrentPosition]);

  // 위치 데이터를 랭킹 아이템으로 변환
  useEffect(() => {
    console.log('🔄 랭킹 아이템 변환 시작:', {
      positionsLength: positions.length,
      usersLength: users?.length,
    });

    if (!positions.length || !users) {
      console.log('⚠️ 변환 조건 불만족:', { hasPositions: !!positions.length, hasUsers: !!users });
      return;
    }

    const items: ArrivalRankingItemType[] = positions.map((position, index) => {
      console.log('👤 사용자 변환:', {
        roomUserId: position.roomUserId,
        online: position.online,
        name: users[index]?.nickname,
      });
      // 현재는 roomUserId와 users 배열의 인덱스가 일치한다고 가정
      // 실제로는 users 배열에 roomUserId 정보가 포함되어야 함
      const user = users[index] || null;

      return {
        rank: index + 1,
        roomUserId: position.roomUserId,
        name: user?.nickname || '알 수 없음',
        imgUrl: user?.profileImage || undefined,
        progress: Math.round(position.progress * 100),
        distance: position.distance,
        speed: Math.round(position.velocity),
        arrived: position.arrived,
        online: position.online,
        estimatedArrivalMinutes: position.estimatedArrivalMinutes,
      };
    });

    setRankingItems(items);
  }, [positions, users]);

  const handleMouseDown = (e: React.MouseEvent) => {
    const startY = e.clientY;
    const startHeight = rankingHeight;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const delta = startY - moveEvent.clientY;
      const newHeight = Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, startHeight + delta));
      setRankingHeight(newHeight);
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const startY = e.touches[0].clientY;
    const startHeight = rankingHeight;

    const onTouchMove = (moveEvent: TouchEvent) => {
      moveEvent.preventDefault();
      const delta = startY - moveEvent.touches[0].clientY;
      const newHeight = Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, startHeight + delta));
      setRankingHeight(newHeight);
    };

    const onTouchEnd = () => {
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };

    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd);
  };

  return (
    <div
      ref={containerRef}
      className="rounded-t-3xl bg-white w-full overflow-hidden flex flex-col transition-none relative z-10"
      style={{ height: rankingHeight }}
    >
      <div
        className="flex justify-center items-center cursor-row-resize h-6"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <MdDragHandle size={24} className="text-text-dark" />
      </div>

      <div className="px-6 py-3 overflow-y-auto hide-scrollbar">
        <h2 className="font-bold ml-3 mb-3">도착 랭킹</h2>
        <div className="flex flex-col gap-2">
          {!appointmentData?.locationLat || !appointmentData?.locationLng ? (
            <div className="text-center text-text-gray py-8">
              <div className="mb-2">📍 약속 장소가 설정되지 않았습니다</div>
              <div className="text-sm">약속 설정에서 목적지를 먼저 설정해주세요</div>
            </div>
          ) : isLoadingLeaderboard ? (
            <div className="text-center text-text-gray py-8">
              <div className="mb-2">📊 리더보드 데이터를 불러오는 중...</div>
            </div>
          ) : rankingItems.length > 0 ? (
            <>
              업데이트 중 표시
              {isUpdating && console.log('업데이트 중')}
              {rankingItems.map((item) => (
                <ArrivalRankingItem
                  key={item.roomUserId}
                  rank={item.rank}
                  name={item.name}
                  imgUrl={item.imgUrl}
                  progress={item.progress}
                  distance={item.distance}
                  speed={item.speed}
                  online={item.online}
                />
              ))}
            </>
          ) : (
            <div className="text-center text-text-gray py-8">실시간 위치 정보를 불러오는 중...</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArrivalRanking;
