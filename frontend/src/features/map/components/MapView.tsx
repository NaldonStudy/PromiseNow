/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import UserMarker from './UserMaker';
import useMapStore from '../map.store';

declare global {
  interface Window {
    kakao: any;
  }
}

const KAKAO_API_URL =
  '//dapi.kakao.com/v2/maps/sdk.js?appkey=d237e8e1648c27e6631635f056ccc121&autoload=false';

const MapView = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const isInitializedRef = useRef<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const rankingHeight = useMapStore((state) => state.rankingHeight);

  // Kakao Maps API 스크립트 로딩
  const loadKakaoMapScript = () => {
    return new Promise<void>((resolve, reject) => {
      if (window.kakao && window.kakao.maps) {
        return resolve();
      }

      const existingScript = document.querySelector(
        `script[src*="dapi.kakao.com"]`,
      ) as HTMLScriptElement;

      if (existingScript) {
        existingScript.addEventListener('load', () => {
          resolve();
        });
        return;
      }

      const script = document.createElement('script');
      script.src = KAKAO_API_URL;
      script.async = true;
      script.addEventListener('load', () => {
        resolve();
      });
      script.addEventListener('error', () => {
        reject();
      });
      document.head.appendChild(script);
    });
  };

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

  const initMap = (lat: number, lng: number) => {
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
  };

  // rankingHeight 변경 시 지도 relayout 실행
  useEffect(() => {
    if (mapRef.current && isInitializedRef.current) {
      // 지도 크기 재조정
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
        await loadKakaoMapScript();

        window.kakao.maps.load(() => {
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
              const lat = position.coords.latitude;
              const lng = position.coords.longitude;
              initMap(lat, lng);
            });
          } else {
            initMap(37.5665, 126.978);
          }
        });
      } catch (err) {
        console.error('Kakao Maps 로딩 실패:', err);
        setIsLoading(false);
      }
    };

    setupMap();

    return () => {
      if (markerRef.current) {
        markerRef.current.setMap(null);
        markerRef.current = null;
      }
    };
  }, []);

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
