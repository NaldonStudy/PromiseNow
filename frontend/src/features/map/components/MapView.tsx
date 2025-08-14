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
import type { PositionRequestDto, PositionResponseDto } from '../../../apis/leaderboard/leaderboard.types';
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
  // 다른 사용자들의 마커들을 관리
  const userMarkersRef = useRef<Map<number, any>>(new Map());

  const isInitializedRef = useRef<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('지도 불러오는 중');
  const { rankingHeight, setMoveToCurrentLocation } = useMapStore();

  // 실시간 위치 데이터 상태
  const [userPositions, setUserPositions] = useState<PositionResponseDto[]>([]);

  // 사용자 정보
  const { user } = useUserStore();
  const roomUserId = useRoomUserInfo(parsedRoomId, user?.userId || 0).data?.roomUserId;
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



  // WebSocket 연결 및 위치 전송
  const { sendPosition } = useLeaderboardSocket(
    parsedRoomId,
    (newPositions: PositionResponseDto[]) => {
      console.log('📡 맵에서 실시간 위치 데이터 수신:', newPositions.length, '명');
      console.log('📊 받은 위치 데이터:', newPositions);
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

  // 커스텀 마커 생성 함수
  const createCustomMarker = useCallback((position: any, imgUrl?: string) => {
    // Kakao Maps API가 완전히 로드되었는지 확인
    if (!window.kakao || !window.kakao.maps || !window.kakao.maps.LatLng) {
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
  const updateUserMarkers = useCallback((positions: PositionResponseDto[]) => {
    console.log('🗺️ updateUserMarkers 호출:', {
      positionsLength: positions.length,
      hasMap: !!mapRef.current,
      hasKakao: !!window.kakao,
      myRoomUserId: myRoomUserInfo?.roomUserId,
      currentMarkersCount: userMarkersRef.current.size,
      usersLength: users?.length
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
        isMyPosition: position.roomUserId === myRoomUserInfo?.roomUserId
      });

      // 내 위치는 제외 (내 마커는 별도로 관리)
      if (position.roomUserId === myRoomUserInfo?.roomUserId) {
        console.log('🚫 내 위치 제외');
        return;
      }

      // 유저 정보에서 프로필 이미지 찾기
      let userImgUrl: string | undefined;
      if (detailedUsers) {
        const userInfo = detailedUsers.find(u => u.roomUserId === position.roomUserId);
        if (userInfo) {
          userImgUrl = userInfo.profileImage || undefined;
          console.log('🔍 유저 정보 찾기 성공:', { 
            roomUserId: position.roomUserId, 
            nickname: userInfo.nickname,
            hasImage: !!userInfo.profileImage 
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
    const onlineUserIds = new Set(positions.map(p => p.roomUserId));
    currentMarkers.forEach((marker, userId) => {
      if (!onlineUserIds.has(userId)) {
        marker.setMap(null);
        currentMarkers.delete(userId);
        console.log('🗑️ 오프라인 마커 제거:', userId);
      }
    });

    console.log('✅ 마커 업데이트 완료. 현재 마커 수:', currentMarkers.size);
  }, [myRoomUserInfo?.roomUserId, createUserMarker, detailedUsers]);

  // 위치 전송 함수
  const sendCurrentPosition = useCallback(() => {
    // 약속 장소가 설정되지 않았으면 위치 전송하지 않음
    if (!appointmentData?.locationLat || !appointmentData?.locationLng) {
      return;
    }

    if (!users || !user?.userId) {
      return;
    }

    // myRoomUserInfo가 아직 로딩 중이면 기다림
    if (!roomUserId && !myRoomUserInfo) {
      console.log('⏳ roomUserId 로딩 중...');
      return;
    }

    if (!roomUserId) {
      console.log('⚠️ roomUserId를 찾을 수 없음:', {
        userId: user?.userId || 0,
        roomId: parsedRoomId,
        myRoomUserInfo,
      });
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
  }, [parsedRoomId, user?.userId, users, sendPosition, appointmentData, roomUserId, myRoomUserInfo]);

  // 실시간 위치 전송 시작/중지
  useEffect(() => {
    if (appointmentData?.locationLat && appointmentData?.locationLng && user?.userId && myRoomUserInfo) {
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
    },
    [createCustomMarker],
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
              maximumAge: 300000,
            },
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
      // 유저 마커들 정리
      userMarkersRef.current.forEach((marker) => {
        if (marker) {
          marker.setMap(null);
        }
      });
      userMarkersRef.current.clear();
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
    if (!user?.userId) {
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
  }, [sendCurrentPosition, user?.userId, appointmentData]);

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
