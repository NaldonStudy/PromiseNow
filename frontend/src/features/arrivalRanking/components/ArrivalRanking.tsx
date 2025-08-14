import { useRef, useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import ArrivalRankingItem from './ArrivalRankingItem';
import { MdDragHandle } from 'react-icons/md';
import useMapStore from '../../map/map.store';
import { useLeaderboardSocket } from '../../../hooks/socket/useLeaderboardSocket';
import { useUsersInRoom, useAppointment } from '../../../hooks/queries';
import { useLeaderboard } from '../../../hooks/queries/leaderboard';
import type {
  PositionResponseDto,
  ArrivalRankingItem as ArrivalRankingItemType,
  UserJoinNotificationDto
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

  // 방 참가자 정보 조회 + 로딩 상태
  const { data: users, isLoading: isLoadingUsers } = useUsersInRoom(parsedRoomId);

  // 약속 정보 조회
  const { data: appointmentData, isLoading: isLoadingAppointment } = useAppointment(parsedRoomId);

  // 초기 리더보드 데이터 조회
  const { data: initialLeaderboard, isLoading: isLoadingLeaderboard } = useLeaderboard(parsedRoomId);

  // 새로운 사용자 참가 알림 처리
  const handleUserJoin = useCallback(
      (notification: UserJoinNotificationDto) => {
        console.log('👋 새로운 사용자 참가:', notification);
        if (initialLeaderboard) {
          setPositions(initialLeaderboard);
        }
      },
      [initialLeaderboard]
  );

  // WebSocket 연결 - 실시간 데이터만 사용
  useLeaderboardSocket(
      parsedRoomId,
      (newPositions: PositionResponseDto[]) => {
        console.log('📡 WebSocket으로 받은 새로운 위치 데이터:', newPositions);
        setPositions(prevPositions => {
          const hasChanges = JSON.stringify(prevPositions) !== JSON.stringify(newPositions);
          console.log('🔄 데이터 변경사항:', hasChanges ? '있음' : '없음');
          return newPositions;
        });
        setIsUpdating(true);
        setTimeout(() => setIsUpdating(false), 1000);
      },
      handleUserJoin,
      appointmentData,
      isLoadingAppointment
  );

  // 초기 데이터 세팅
  useEffect(() => {
    console.log('🔄 ArrivalRanking 컴포넌트 마운트/업데이트:', { roomId: parsedRoomId });
    setPositions([]);
    setRankingItems([]);
    setIsUpdating(false);

    if (initialLeaderboard && initialLeaderboard.length > 0) {
      console.log('📊 초기 리더보드 데이터 설정:', initialLeaderboard);
      setPositions(initialLeaderboard);
    }
  }, [initialLeaderboard, parsedRoomId]);

  // 위치 데이터를 랭킹 아이템으로 변환
  useEffect(() => {
    console.log('🔄 랭킹 아이템 변환 시작:', {
      positionsLength: positions.length,
      usersLength: users?.length,
      isLoadingUsers
    });

    if (isLoadingUsers) {
      console.log('⏳ users 로딩 중...');
      return;
    }
    if (!Array.isArray(users) || users.length === 0) {
      console.log('⚠️ users 데이터 없음');
      return;
    }
    if (!positions.length) {
      console.log('⚠️ positions 데이터 없음');
      return;
    }

    const items: ArrivalRankingItemType[] = positions.map((position, index) => {
      const user = users.find(u => u.roomUserId === position.roomUserId) || null;

      // ETA 대신 distance(km) 기반으로 출력
      let distanceText: string;
      if (position.arrived) {
        distanceText = '도착';
      } else if (position.distance < 1) {
        // 1km 미만이면 m 단위
        distanceText = `${Math.round(position.distance * 1000)}m`;
      } else {
        // 1km 이상이면 소수 1자리 km
        distanceText = `${position.distance.toFixed(1)}km`;
      }

      return {
        rank: index + 1,
        roomUserId: position.roomUserId,
        name: user?.nickname || '알 수 없음',
        imgUrl: user?.profileImage || undefined,
        progress: Math.round(position.progress * 100), // %
        eta: distanceText, // 이제 ETA 대신 distance 표시
        speed: Math.round(position.velocity), // km/h 반올림
        arrived: position.arrived,
        online: position.online
      };
    });

    setRankingItems(items);
  }, [positions, users, isLoadingUsers]);

  // 높이 조절 - 마우스
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

  // 높이 조절 - 터치
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
                  {isUpdating && (
                      <div className="text-xs px-3 py-1 rounded-full mb-2 bg-blue-100 text-blue-700">
                        🔄 업데이트중...
                      </div>
                  )}
                  {rankingItems.map(item => (
                      <ArrivalRankingItem
                          key={item.roomUserId}
                          rank={item.rank}
                          name={item.name}
                          imgUrl={item.imgUrl}
                          progress={item.progress}
                          eta={item.eta} // distance 기반
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
