/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { createRoot } from 'react-dom/client';
import useMapStore from '../map.store';
import { useLeaderboardSocket } from '../../../hooks/socket/useLeaderboardSocket';
import { useUserStore } from '../../../stores/user.store';
import { useRoomUserStore } from '../../../stores/roomUser.store';
import { useUsersInRoom, useAppointment, useMyRoomUserInfo } from '../../../hooks/queries/room';
import type { PositionRequestDto } from '../../../apis/leaderboard/leaderboard.types';
import UserMarker from './UserMaker';

const MapView = () => {
  const { id } = useParams<{ id: string }>();
  const parsedRoomId = parseInt(id || '', 10);
  
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

  // 내 위치(커스텀 오버레이)
  const markerRef = useRef<any>(null);
  // 확정 장소(커스텀 오버레이로 동일하게)
  const targetMarkerRef = useRef<any>(null);

  const isInitializedRef = useRef<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('지도 불러오는 중');
  const { rankingHeight, setMoveToCurrentLocation } = useMapStore();
  
  // 사용자 정보
  const { userId } = useUserStore();
  const { getRoomUserId } = useRoomUserStore();
  const { data: users } = useUsersInRoom(parsedRoomId);
  const { data: myRoomUserInfo } = useMyRoomUserInfo(parsedRoomId, userId!);
  
  // 약속 정보 조회
  const { data: appointmentData } = useAppointment(parsedRoomId);
  
  // 위치 전송 인터벌
  const positionIntervalRef = useRef<number | null>(null);



  // WebSocket 연결 및 위치 전송
  const { sendPosition } = useLeaderboardSocket(parsedRoomId, () => {
    // 리더보드 업데이트는 ArrivalRanking에서 처리
  }, undefined, appointmentData, false);

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

  // 커스텀 마커 생성 함수
  const createCustomMarker = useCallback((position: any, imgUrl?: string) => {
    // Kakao Maps API가 완전히 로드되었는지 확인
    if (!window.kakao || !window.kakao.maps || !window.kakao.maps.CustomOverlay) {
      return null;
    }

    const kakao = window.kakao;

    const markerContainer = document.createElement('div');
    const root = createRoot(markerContainer);
    root.render(<UserMarker imgUrl={imgUrl} />);

    const customOverlay = new kakao.maps.CustomOverlay({
      position,
      content: markerContainer,
      yAnchor: 1,
    });

    return customOverlay;
  }, []);

  // 위치 전송 함수
  const sendCurrentPosition = useCallback(() => {
    // 약속 장소가 설정되지 않았으면 위치 전송하지 않음
    if (!appointmentData?.locationLat || !appointmentData?.locationLng) {
      return;
    }

    if (!users || !userId) {
      return;
    }

    // roomUserId 가져오기 (store에서 먼저 시도, 없으면 API에서 조회)
    let roomUserId = getRoomUserId(parsedRoomId);
    
    if (!roomUserId && myRoomUserInfo) {
      roomUserId = myRoomUserInfo.roomUserId;
      console.log('📡 API에서 roomUserId 조회:', roomUserId);
    }
    
    // myRoomUserInfo가 아직 로딩 중이면 기다림
    if (!roomUserId && !myRoomUserInfo) {
      console.log('⏳ roomUserId 로딩 중...');
      return;
    }
    
    if (!roomUserId) {
      console.log('⚠️ roomUserId를 찾을 수 없음:', { userId, roomId: parsedRoomId, myRoomUserInfo });
      return;
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          const positionRequest: PositionRequestDto = {
            roomId: parsedRoomId,
            roomUserId,
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
  }, [parsedRoomId, userId, users, sendPosition, appointmentData, getRoomUserId, myRoomUserInfo]);

  // 실시간 위치 전송 시작/중지
  useEffect(() => {
    if (appointmentData?.locationLat && appointmentData?.locationLng && userId && myRoomUserInfo) {
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
  }, [appointmentData, userId, myRoomUserInfo, sendCurrentPosition]);

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
  const initMap = useCallback((lat: number, lng: number) => {
    if (isInitializedRef.current) return;
    if (!mapContainerRef.current) return;

    // Kakao Maps API가 완전히 로드되었는지 확인
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

      // 커스텀 마커 생성 및 표시
      markerRef.current = createCustomMarker(center);
      if (markerRef.current) {
        markerRef.current.setMap(mapRef.current);
      }

      // 초기화 완료 플래그
      isInitializedRef.current = true;
      setIsLoading(false);
    } catch {
      setIsLoading(false);
    }
  }, [createCustomMarker]);

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
        // Kakao Maps API 로드 대기
        await waitForKakaoMaps();
        
        setLoadingMessage('지도 컨테이너 준비 중...');
        // 지도 컨테이너가 준비될 때까지 대기
        await new Promise<void>((resolve) => {
          const checkContainer = () => {
            if (mapContainerRef.current) {
              resolve();
            } else {
              setTimeout(checkContainer, 50);
            }
          };
          checkContainer();
        });

        setLoadingMessage('위치 정보 가져오는 중...');
        // 위치 정보 가져오기
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const lat = position.coords.latitude;
              const lng = position.coords.longitude;
              setLoadingMessage('지도 초기화 중...');
              initMap(lat, lng);
            },
            (error) => {
              console.error('위치 정보를 가져올 수 없습니다:', error);
              setLoadingMessage('기본 위치로 초기화 중...');
              // 위치 정보 실패 시 기본 위치로 초기화
              initMap(37.5665, 126.978);
            },
            {
              timeout: 10000,
              enableHighAccuracy: false,
              maximumAge: 300000
            }
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
      if (markerRef.current) {
        markerRef.current.setMap(null);
        markerRef.current = null;
      }
      if (targetMarkerRef.current) {
        targetMarkerRef.current.setMap(null);
        targetMarkerRef.current = null;
      }
      setMoveToCurrentLocation(null);
    };
  }, []); // 의존성 배열을 비워서 한 번만 실행

  // store에 현재 위치 이동 함수 등록
  useEffect(() => {
    setMoveToCurrentLocation(moveToCurrentLocation);
    return () => {
      setMoveToCurrentLocation(null);
    };
  }, [moveToCurrentLocation, setMoveToCurrentLocation]);

  // 위치 전송 시작/중지 (지도 초기화와 독립적으로 실행)
  useEffect(() => {
    if (!userId) {
      return;
    }



    // 약속 장소가 설정되지 않았으면 위치 전송을 시작하지 않음
    if (!appointmentData?.locationLat || !appointmentData?.locationLng) {
      return;
    }
    
    // 10초마다 위치 전송
    positionIntervalRef.current = window.setInterval(() => {
      sendCurrentPosition();
    }, 10000);

    // 초기 위치 전송
    sendCurrentPosition();

    return () => {
      if (positionIntervalRef.current) {
        clearInterval(positionIntervalRef.current);
        positionIntervalRef.current = null;
      }
    };
  }, [sendCurrentPosition, userId, appointmentData]);

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
    </div>
  );
};

export default MapView;
