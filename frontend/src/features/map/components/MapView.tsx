/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { useParams } from 'react-router-dom';
import type {
  PositionRequestDto,
  PositionResponseDto,
} from '../../../apis/leaderboard/leaderboard.types';
import { getUsersInRoomDetailed } from '../../../apis/room/roomuser.api';
import type { DetailedInfoResponse } from '../../../apis/room/roomuser.types';
import { useLeaderboard } from '../../../hooks/queries/leaderboard';
import type {
  PositionRequestDto,
  PositionResponseDto,
} from '../../../apis/leaderboard/leaderboard.types';
import UserMarker from './UserMaker';
import UserMarkers from './mapView/UserMarkers';

const MapView = () => {
  const { id } = useParams<{ id: string }>();
  const roomId = Number.parseInt(id ?? '', 10);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

  // 내 마커(현재 위치)
  const myMarkerRef = useRef<any>(null);

  const isInitializedRef = useRef<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('지도 불러오는 중');
  const { rankingHeight, setMoveToCurrentLocation } = useMapStore();

  // 실시간 위치
  const [userPositions, setUserPositions] = useState<PositionResponseDto[]>([]);

  // 로그인/룸유저
  const { user } = useUserStore();
  const roomUserId = useRoomUserInfo(parsedRoomId, user?.userId || 0).data?.roomUserId;
  const { data: users } = useUsersInRoom(parsedRoomId);
  const { data: myRoomUserInfo } = useRoomUserInfo(parsedRoomId, user?.userId || 0);

  // 상세 유저 정보 (roomUserId 포함)
  const [detailedUsers, setDetailedUsers] = useState<DetailedInfoResponse[]>([]);

  // 약속(도착지)
  const { data: appointmentData } = useAppointment(roomId);

  // 초기 리더보드
  const { data: initialLeaderboard } = useLeaderboard(roomId);

  // 위치 전송
  const positionIntervalRef = useRef<number | null>(null);

  // WebSocket 연결 및 위치 전송
  const { sendPosition } = useLeaderboardSocket(
    roomId,
    (positions: PositionResponseDto[]) => {
      setUserPositions(positions);
    },
    undefined,
    appointmentData,
    false,
  );

  // Kakao 로드 대기
  const waitForKakao = useCallback(
    () =>
      new Promise<void>((resolve) => {
        const chk = () => {
          if (window.kakao?.maps?.LatLng) resolve();
          else setTimeout(chk, 100);
        };
        chk();
      }),
    [],
  );

  // 내 마커 생성
  const createMyMarker = useCallback((pos: any) => {
    if (!window.kakao || !window.kakao.maps?.LatLng) return null;
    const kakao = window.kakao;

    const div = document.createElement('div');
    const root = createRoot(div);
    root.render(<UserMarker />);

    const overlay = new kakao.maps.CustomOverlay({
      position: pos,
      content: div,
      yAnchor: 1,
      zIndex: 80,
    });
    return overlay;
  }, []);

  // 유저 마커 생성 함수
  const createUserMarker = useCallback((_roomUserId: number, position: any, imgUrl?: string) => {
    if (!mapRef.current || !window.kakao || !window.kakao.maps) {
      return null;
    }

    const kakao = window.kakao;
    const markerContainer = document.createElement('div');
    const root = createRoot(markerContainer);
    root.render(<UserMarker imgUrl={imgUrl} color="text-blue-500" />);

    const customOverlay = new kakao.maps.CustomOverlay({
      position,
      content: markerContainer,
      yAnchor: 1,
    });

    customOverlay.setMap(mapRef.current);
    return customOverlay;
  }, []);

  // 유저 마커 업데이트 함수
  const updateUserMarkers = useCallback(
    (positions: PositionResponseDto[]) => {
      console.log('🗺️ updateUserMarkers 호출:', {
        positionsLength: positions.length,
        hasMap: !!mapRef.current,
        hasKakao: !!window.kakao,
        myRoomUserId: myRoomUserInfo?.roomUserId,
        currentMarkersCount: userMarkersRef.current.size,
        usersLength: users?.length,
      });

      if (!mapRef.current || !window.kakao || !window.kakao.maps) {
        console.log('⚠️ 맵 초기화되지 않음');
        return;
      }

      const kakao = window.kakao;
      const currentMarkers = userMarkersRef.current;

      // 현재 위치 데이터에서 유저 정보 찾기
      positions.forEach((position) => {
        console.log('👤 유저 위치 처리:', {
          roomUserId: position.roomUserId,
          lat: position.lat,
          lng: position.lng,
          isMyPosition: position.roomUserId === myRoomUserInfo?.roomUserId,
        });

        // 내 위치는 제외 (내 마커는 별도로 관리)
        if (position.roomUserId === myRoomUserInfo?.roomUserId) {
          console.log('🚫 내 위치 제외');
          return;
        }

        // 유저 정보에서 프로필 이미지 찾기
        let userImgUrl: string | undefined;
        if (detailedUsers) {
          const userInfo = detailedUsers.find((u) => u.roomUserId === position.roomUserId);
          if (userInfo) {
            userImgUrl = userInfo.profileImage || undefined;
            console.log('🔍 유저 정보 찾기 성공:', {
              roomUserId: position.roomUserId,
              nickname: userInfo.nickname,
              hasImage: !!userInfo.profileImage,
            });
          } else {
            console.log('🔍 유저 정보 찾기 실패:', { roomUserId: position.roomUserId });
          }
        }

        const newPosition = new kakao.maps.LatLng(position.lat, position.lng);

        if (currentMarkers.has(position.roomUserId)) {
          // 기존 마커가 있으면 위치만 업데이트
          const existingMarker = currentMarkers.get(position.roomUserId);
          if (existingMarker) {
            existingMarker.setPosition(newPosition);
            console.log('📍 기존 마커 위치 업데이트:', position.roomUserId);
          }
        } else {
          // 새로운 마커 생성 (프로필 이미지 포함)
          const newMarker = createUserMarker(position.roomUserId, newPosition, userImgUrl);
          if (newMarker) {
            currentMarkers.set(position.roomUserId, newMarker);
            console.log('🆕 새 마커 생성:', position.roomUserId, '이미지:', userImgUrl);
          }
        }
      });

      // 더 이상 온라인이 아닌 유저들의 마커 제거
      const onlineUserIds = new Set(positions.map((p) => p.roomUserId));
      currentMarkers.forEach((marker, userId) => {
        if (!onlineUserIds.has(userId)) {
          marker.setMap(null);
          currentMarkers.delete(userId);
          console.log('🗑️ 오프라인 마커 제거:', userId);
        }
      });

      console.log('✅ 마커 업데이트 완료. 현재 마커 수:', currentMarkers.size);
    },
    [myRoomUserInfo?.roomUserId, createUserMarker, detailedUsers],
  );

  // 위치 전송 함수
  const sendCurrentPosition = useCallback(() => {
    if (!appointmentData?.locationLat || !appointmentData?.locationLng) return;
    if (!user?.userId || !myRoomUserId) return;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (geo) => {
          const req: PositionRequestDto = {
            roomId,
            roomUserId: myRoomUserId,
            lat: geo.coords.latitude,
            lng: geo.coords.longitude,
            online: true,
          };
          sendPosition(req);
        },
        (e) => console.error('위치 실패', e),
      );
    }
  }, [
    parsedRoomId,
    user?.userId,
    users,
    sendPosition,
    appointmentData,
    roomUserId,
    myRoomUserInfo,
  ]);

  // 실시간 위치 전송 시작/중지
  useEffect(() => {
    if (
      appointmentData?.locationLat &&
      appointmentData?.locationLng &&
      user?.userId &&
      myRoomUserInfo
    ) {
      // 5초마다 위치 전송
      const interval = setInterval(() => {
        sendCurrentPosition();
      }, 5000);

      console.log('📍 실시간 위치 전송 시작 (roomUserId:', myRoomUserInfo.roomUserId, ')');

      return () => {
        clearInterval(interval);
        console.log('📍 실시간 위치 전송 중지');
      };
    }
  }, [appointmentData, user?.userId, myRoomUserInfo, sendCurrentPosition]);

  // 상세 유저 정보 가져오기
  useEffect(() => {
    const fetchDetailedUsers = async () => {
      try {
        const users = await getUsersInRoomDetailed(parsedRoomId);
        if (users) {
          setDetailedUsers(users);
          console.log('👥 상세 유저 정보 로드:', users.length, '명');
        }
      } catch (error) {
        console.error('❌ 상세 유저 정보 로드 실패:', error);
      }
    };

    if (parsedRoomId) {
      fetchDetailedUsers();
    }
  }, [parsedRoomId]);

  // 초기 리더보드 데이터로 유저 마커 설정
  useEffect(() => {
    if (initialLeaderboard && initialLeaderboard.length > 0 && isInitializedRef.current) {
      console.log('🗺️ 초기 유저 마커 설정:', initialLeaderboard.length, '명');
      setUserPositions(initialLeaderboard);
      updateUserMarkers(initialLeaderboard);
    }
  }, [initialLeaderboard, updateUserMarkers]);

  // 실시간 위치 데이터로 유저 마커 업데이트
  useEffect(() => {
    if (userPositions.length > 0 && isInitializedRef.current) {
      console.log('🗺️ 실시간 유저 마커 업데이트:', userPositions.length, '명');
      updateUserMarkers(userPositions);
    }
  }, [userPositions, updateUserMarkers]);

  // 현재 위치로 이동
  const moveToCurrentLocation = useCallback(() => {
    if (!mapRef.current || !isInitializedRef.current) return;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const kakao = window.kakao;
          const newCenter = new kakao.maps.LatLng(lat, lng);

          mapRef.current.setCenter(newCenter);

          if (markerRef.current) {
            markerRef.current.setPosition(newCenter);
          }
        },
        (error) => {
          console.error('위치 정보를 가져올 수 없습니다:', error);
          alert('위치 정보를 가져올 수 없습니다. 위치 서비스를 활성화해주세요.');
        },
      );
    } else {
      alert('이 브라우저에서는 위치 서비스가 지원되지 않습니다.');
    }
  }, []);

  // 지도 초기화
  const initMap = useCallback(
    (lat: number, lng: number) => {
      if (isInitializedRef.current || !mapContainerRef.current) return;
      if (!window.kakao || !window.kakao.maps?.LatLng) {
        setIsLoading(false);
        return;
      }
      const kakao = window.kakao;
      const center = new kakao.maps.LatLng(lat, lng);
      mapRef.current = new kakao.maps.Map(mapContainerRef.current, { center, level: 3 });

      // 내 마커
      myMarkerRef.current = createMyMarker(center);
      myMarkerRef.current?.setMap(mapRef.current);

      isInitializedRef.current = true;
      setIsLoading(false);
    },
    [createMyMarker],
  );

  // 컨테이너 리사이즈(높이)
  useEffect(() => {
    if (mapRef.current && isInitializedRef.current) {
      setTimeout(() => mapRef.current.relayout(), 0);
    }
  }, [rankingHeight]);

  // 최초 로딩
  useEffect(() => {
    if (isInitializedRef.current) return;
    (async () => {
      try {
        setLoadingMessage('Kakao Maps 로딩 중...');
        await waitForKakao();

        setLoadingMessage('위치 조회 중...');
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (geo) => initMap(geo.coords.latitude, geo.coords.longitude),
            () => initMap(37.5665, 126.978), // 실패시 서울
            { timeout: 10000, enableHighAccuracy: false, maximumAge: 300000 },
          );
        } else {
          initMap(37.5665, 126.978);
        }
      } finally {
        // no-op
      }
    })();

    return () => {
      myMarkerRef.current?.setMap?.(null);
      myMarkerRef.current = null;
    };
  }, [waitForKakao, initMap]);

  // 현재 위치로 이동 기능(store)
  const moveToCurrentLocation = useCallback(() => {
    if (!mapRef.current || !isInitializedRef.current) return;
    if (!window.kakao || !window.kakao.maps?.LatLng) return;

    navigator.geolocation?.getCurrentPosition(
      (geo) => {
        const kakao = window.kakao;
        const pos = new kakao.maps.LatLng(geo.coords.latitude, geo.coords.longitude);
        mapRef.current.setCenter(pos);
        myMarkerRef.current?.setPosition?.(pos);
      },
      (e) => {
        console.error(e);
        alert('위치 서비스를 활성화해주세요.');
      },
    );
  }, []);
  useEffect(() => {
    setMoveToCurrentLocation(moveToCurrentLocation);
    return () => setMoveToCurrentLocation(null);
  }, [moveToCurrentLocation, setMoveToCurrentLocation]);

  // 초기 리더보드 -> 마커 반영
  useEffect(() => {
    if (initialLeaderboard?.length && isInitializedRef.current) {
      setUserPositions(initialLeaderboard);
    }
  }, [initialLeaderboard]);

  // 주기 전송
  useEffect(() => {
    if (!user?.userId || !myRoomUserId) return;
    if (!appointmentData?.locationLat || !appointmentData?.locationLng) return;

    positionIntervalRef.current = window.setInterval(sendCurrentPosition, 10000);
    sendCurrentPosition();

    return () => {
      if (positionIntervalRef.current) {
        clearInterval(positionIntervalRef.current);
        positionIntervalRef.current = null;
      }
    };
  }, [
    user?.userId,
    myRoomUserId,
    appointmentData?.locationLat,
    appointmentData?.locationLng,
    sendCurrentPosition,
  ]);

  // 상세 유저 정보
  useEffect(() => {
    (async () => {
      try {
        const list = await getUsersInRoomDetailed(roomId);
        setDetailedUsers(list ?? []);
      } catch (e) {
        console.error('상세 유저 로드 실패', e);
      }
    })();
  }, [roomId]);

  return (
    <div className="h-full relative bg-gray">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray">
          <div className="text-text-gray">{loadingMessage}</div>
        </div>
      )}

      {/* 핵심: 높이는 padding이 아니라 height로 주세요. */}
      <div
        ref={mapContainerRef}
        className="w-full"
        style={{ height: `calc(100vh - ${rankingHeight}px)` }}
      />

      {/* 도착지 마커 */}
      <TargetMarker
        map={mapRef.current}
        ready={isInitializedRef.current}
        appointment={appointmentData}
        centerOnCreate
      />

      {/* 타 사용자 마커 */}
      <UserMarkers
        map={mapRef.current}
        ready={isInitializedRef.current}
        myRoomUserId={myRoomUserId}
        positions={userPositions}
        detailedUsers={detailedUsers}
      />
    </div>
  );
};

export default MapView;
