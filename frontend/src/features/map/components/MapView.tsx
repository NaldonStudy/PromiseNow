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
import { useAppointment, useRoomUserInfo, useUsersInRoom } from '../../../hooks/queries/room';
import { useLeaderboardSocket } from '../../../hooks/socket/useLeaderboardSocket';
import { useUserStore } from '../../../stores/user.store';
import useMapStore from '../map.store';
import TargetMarker from './mapView/TargetMarker';
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
  const myRoomUserInfo = useRoomUserInfo(roomId, user?.userId || 0).data;
  const myRoomUserId = myRoomUserInfo?.roomUserId;

  // 참여자 목록 & 상세(프로필)
  useUsersInRoom(roomId); // 필요시 다른 곳에서 사용
  const [detailedUsers, setDetailedUsers] = useState<DetailedInfoResponse[]>([]);

  // 약속(도착지)
  const { data: appointmentData } = useAppointment(roomId);

  // 초기 리더보드
  const { data: initialLeaderboard } = useLeaderboard(roomId);

  // 위치 전송
  const positionIntervalRef = useRef<number | null>(null);

  // 소켓
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

  // 현재 위치 전송
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
    appointmentData?.locationLat,
    appointmentData?.locationLng,
    user?.userId,
    myRoomUserId,
    roomId,
    sendPosition,
  ]);

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
