/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import UserMarker from './UserMaker';
import useMapStore from '../map.store';

const MapView = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const isInitializedRef = useRef<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const { rankingHeight, setMoveToCurrentLocation } = useMapStore();

  // Kakao Maps API가 로드될 때까지 대기하는 함수
  const waitForKakaoMaps = useCallback(() => {
    return new Promise<void>((resolve) => {
      const checkKakao = () => {
        if (window.kakao && window.kakao.maps) {
          resolve();
        } else {
          setTimeout(checkKakao, 100);
        }
      };
      checkKakao();
    });
  }, []);

  // 커스텀 마커 생성 함수
  const createCustomMarker = (position: any, imgUrl?: string) => {
    const kakao = window.kakao;

    // React 컴포넌트를 DOM에 렌더링
    const markerContainer = document.createElement('div');
    const root = createRoot(markerContainer);
    root.render(<UserMarker imgUrl={imgUrl} />);

    // 커스텀 오버레이 생성
    const customOverlay = new kakao.maps.CustomOverlay({
      position: position,
      content: markerContainer,
      yAnchor: 1,
    });

    return customOverlay;
  };

  // 현재 위치로 이동하는 함수
  const moveToCurrentLocation = useCallback(() => {
    if (!mapRef.current || !isInitializedRef.current) return;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const kakao = window.kakao;
          const newCenter = new kakao.maps.LatLng(lat, lng);

          // 지도 중심을 현재 위치로 이동
          mapRef.current.setCenter(newCenter);

          // 마커도 현재 위치로 이동
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

  const initMap = useCallback((lat: number, lng: number) => {
    // 이미 초기화되었다면 중복 실행 방지
    if (isInitializedRef.current) return;
    if (!mapContainerRef.current) return;

    const kakao = window.kakao;
    const center = new kakao.maps.LatLng(lat, lng);

    mapRef.current = new kakao.maps.Map(mapContainerRef.current, {
      center,
      level: 3,
    });

    // 커스텀 마커 생성 및 표시
    markerRef.current = createCustomMarker(center);
    markerRef.current.setMap(mapRef.current);

    // 초기화 완료 플래그
    isInitializedRef.current = true;
    setIsLoading(false);
  }, []);

  // rankingHeight 변경 시 지도 크기 재조정
  useEffect(() => {
    if (mapRef.current && isInitializedRef.current) {
      setTimeout(() => {
        mapRef.current.relayout();
      }, 0);
    }
  }, [rankingHeight]);

  useEffect(() => {
    // 이미 초기화되었다면 실행하지 않음
    if (isInitializedRef.current) return;

    const setupMap = async () => {
      try {
        // useKakaoLoader로 이미 로드되었거나 로드 중이므로 대기만 하면 됨
        await waitForKakaoMaps();

        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition((position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            initMap(lat, lng);
          });
        } else {
          initMap(37.5665, 126.978);
        }
      } catch (err) {
        console.error('Kakao Maps 초기화 실패:', err);
        setIsLoading(false);
      }
    };

    setupMap();

    return () => {
      if (markerRef.current) {
        markerRef.current.setMap(null);
        markerRef.current = null;
      }
      // cleanup 시 store에서 함수 제거
      setMoveToCurrentLocation(null);
    };
  }, [initMap, setMoveToCurrentLocation, waitForKakaoMaps]);

  // moveToCurrentLocation 함수를 store에 등록
  useEffect(() => {
    setMoveToCurrentLocation(moveToCurrentLocation);

    return () => {
      setMoveToCurrentLocation(null);
    };
  }, [moveToCurrentLocation, setMoveToCurrentLocation]);

  return (
    <div className="h-full relative bg-gray">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray">
          <div className="text-text-gray">지도 불러오는 중</div>
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
