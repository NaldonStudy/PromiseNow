/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { createRoot } from 'react-dom/client';

import useMapStore from '../map.store';
import { useLeaderboardSocket } from '../../../hooks/socket/useLeaderboardSocket';
import { useUserStore } from '../../../stores/user.store';
import { useUsersInRoom, useAppointment, useRoomUserInfo } from '../../../hooks/queries/room';
import { getUsersInRoomDetailed } from '../../../apis/room/roomuser.api';
import type { DetailedInfoResponse } from '../../../apis/room/roomuser.types';
import { useLeaderboard } from '../../../hooks/queries/leaderboard';
import type {
  PositionRequestDto,
  PositionResponseDto,
} from '../../../apis/leaderboard/leaderboard.types';
import UserMarker from './UserMaker';

// ⬇️ 분리한 컴포넌트
import TargetMarker from './mapView/TargetMarker';
import UserMarkers from './mapView/UserMarkers';

const MapView = () => {
  const { id } = useParams<{ id: string }>();
  const parsedRoomId = parseInt(id || '', 10);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

  // 내 위치(커스텀 오버레이)
  const myMarkerRef = useRef<any>(null);

  const isInitializedRef = useRef<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('지도 불러오는 중');
  const { rankingHeight, setMoveToCurrentLocation } = useMapStore();

  // 실시간 위치 데이터 상태
  const [userPositions, setUserPositions] = useState<PositionResponseDto[]>([]);

  // 사용자 정보
  const { user } = useUserStore();
  const { data: users } = useUsersInRoom(parsedRoomId);
  const { data: myRoomUserInfo } = useRoomUserInfo(parsedRoomId, user?.userId || 0);

  // 상세 유저 정보 (roomUserId 포함)
  const [detailedUsers, setDetailedUsers] = useState<DetailedInfoResponse[]>([]);

  // 약속 정보 조회
  const { data: appointmentData } = useAppointment(parsedRoomId);

  // 리더보드 초기 데이터 조회
  const { data: initialLeaderboard } = useLeaderboard(parsedRoomId);

  // 위치 전송 인터벌
  const positionIntervalRef = useRef<number | null>(null);

  // WebSocket 연결 및 위치 수신
  const { sendPosition } = useLeaderboardSocket(
    parsedRoomId,
    (newPositions: PositionResponseDto[]) => {
      setUserPositions(newPositions);
    },
    undefined,
    appointmentData,
    false,
  );

  // Kakao Maps API 로드 대기
  const waitForKakaoMaps = useCallback(() => {
    return new Promise<void>((resolve) => {
      const checkKakao = () => {
        if (window.kakao && window.kakao.maps && window.kakao.maps.LatLng) {
          resolve();
        } else {
          setTimeout(checkKakao, 100);
        }
      };
      checkKakao();
    });
  }, []);

  // 내 마커 생성
  const createMyMarker = useCallback((position: any) => {
    if (!window.kakao || !window.kakao.maps?.LatLng) return null;
    const kakao = window.kakao;

    const markerContainer = document.createElement('div');
    const root = createRoot(markerContainer);
    root.render(<UserMarker />);

    const overlay = new kakao.maps.CustomOverlay({
      position,
      content: markerContainer,
      yAnchor: 1,
    });

    return overlay;
  }, []);

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
          if (myMarkerRef.current) myMarkerRef.current.setPosition(newCenter);
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
      if (isInitializedRef.current) return;
      if (!mapContainerRef.current) return;

      if (!window.kakao || !window.kakao.maps || !window.kakao.maps.LatLng) {
        setIsLoading(false);
        return;
      }

      try {
        const kakao = window.kakao;
        const center = new kakao.maps.LatLng(lat, lng);

        mapRef.current = new kakao.maps.Map(mapContainerRef.current, {
          center,
          level: 3,
        });

        // 내 마커 생성 및 표시
        myMarkerRef.current = createMyMarker(center);
        if (myMarkerRef.current) myMarkerRef.current.setMap(mapRef.current);

        isInitializedRef.current = true;
        setIsLoading(false);
      } catch {
        setIsLoading(false);
      }
    },
    [createMyMarker],
  );

  // rankingHeight 변경 시 지도 크기 재조정
  useEffect(() => {
    if (mapRef.current && isInitializedRef.current) {
      setTimeout(() => {
        mapRef.current.relayout();
      }, 0);
    }
  }, [rankingHeight]);

  // 지도 초기화 (한 번만 실행)
  useEffect(() => {
    if (isInitializedRef.current) return;

    const setupMap = async () => {
      try {
        setLoadingMessage('Kakao Maps 로딩 중...');
        await waitForKakaoMaps();

        setLoadingMessage('지도 컨테이너 준비 중...');
        await new Promise<void>((resolve) => {
          const checkContainer = () => {
            if (mapContainerRef.current) resolve();
            else setTimeout(checkContainer, 50);
          };
          checkContainer();
        });

        setLoadingMessage('위치 정보 가져오는 중...');
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const lat = position.coords.latitude;
              const lng = position.coords.longitude;
              setLoadingMessage('지도 초기화 중...');
              initMap(lat, lng);
            },
            () => {
              setLoadingMessage('기본 위치로 초기화 중...');
              initMap(37.5665, 126.978);
            },
            { timeout: 10000, enableHighAccuracy: false, maximumAge: 300000 },
          );
        } else {
          setLoadingMessage('기본 위치로 초기화 중...');
          initMap(37.5665, 126.978);
        }
      } catch {
        setLoadingMessage('지도 로딩 실패');
        setIsLoading(false);
      }
    };

    setupMap();

    return () => {
      if (myMarkerRef.current) {
        myMarkerRef.current.setMap(null);
        myMarkerRef.current = null;
      }
      setMoveToCurrentLocation(null);
    };
  }, [initMap, setMoveToCurrentLocation, waitForKakaoMaps]);

  // store에 현재 위치 이동 함수 등록
  useEffect(() => {
    setMoveToCurrentLocation(moveToCurrentLocation);
    return () => {
      setMoveToCurrentLocation(null);
    };
  }, [moveToCurrentLocation, setMoveToCurrentLocation]);

  // 상세 유저 정보 가져오기
  useEffect(() => {
    const fetchDetailedUsers = async () => {
      try {
        const list = await getUsersInRoomDetailed(parsedRoomId);
        if (list) setDetailedUsers(list);
      } catch (error) {
        console.error('❌ 상세 유저 정보 로드 실패:', error);
      }
    };

    if (parsedRoomId) fetchDetailedUsers();
  }, [parsedRoomId]);

  // 초기 리더보드 데이터로 초기 위치 상태 반영
  useEffect(() => {
    if (initialLeaderboard && initialLeaderboard.length > 0 && isInitializedRef.current) {
      setUserPositions(initialLeaderboard);
    }
  }, [initialLeaderboard]);

  // 현재 위치 서버로 전송
  const sendCurrentPosition = useCallback(() => {
    if (!appointmentData?.locationLat || !appointmentData?.locationLng) return;
    if (!users || !user?.userId) return;

    const myRoomUserId = myRoomUserInfo?.roomUserId;
    if (!myRoomUserId) return;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;

          const positionRequest: PositionRequestDto = {
            roomId: parsedRoomId,
            roomUserId: myRoomUserId,
            lat,
            lng,
            online: true,
          };

          sendPosition(positionRequest);
        },
        (error) => {
          console.error('위치 정보를 가져올 수 없습니다:', error);
        },
      );
    }
  }, [appointmentData, users, user?.userId, myRoomUserInfo?.roomUserId, parsedRoomId, sendPosition]);

  // 위치 전송 시작/중지 (지도와 독립적으로)
  useEffect(() => {
    if (!user?.userId) return;
    if (!appointmentData?.locationLat || !appointmentData?.locationLng) return;

    positionIntervalRef.current = window.setInterval(() => {
      sendCurrentPosition();
    }, 10000);

    sendCurrentPosition();

    return () => {
      if (positionIntervalRef.current) {
        clearInterval(positionIntervalRef.current);
        positionIntervalRef.current = null;
      }
    };
  }, [sendCurrentPosition, user?.userId, appointmentData]);

  const ready = isInitializedRef.current;

  return (
    <div className="h-full relative bg-gray">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray">
          <div className="text-text-gray">{loadingMessage}</div>
        </div>
      )}

      <div
        ref={mapContainerRef}
        className="w-full"
        style={{ paddingBottom: `calc(100vh - ${rankingHeight}px)` }}
      />

      {/* ✅ 도착지(확정 장소) 마커 */}
      <TargetMarker map={mapRef.current} ready={ready} appointment={appointmentData} />

      {/* ✅ 다른 사용자 마커들 */}
      <UserMarkers
        map={mapRef.current}
        ready={ready}
        positions={userPositions}
        detailedUsers={detailedUsers}
        myRoomUserId={myRoomUserInfo?.roomUserId}
      />
    </div>
  );
};

export default MapView;
