/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { useParams } from 'react-router-dom';
import useMapStore from '../map.store';
import UserMarker from './UserMaker';

// 약속 상세 훅/타입 import
import type { AppointmentResponse } from '../../../apis/room/room.types';
import { useAppointment } from '../../../hooks/queries/room';

type TargetPin = { lat: number; lng: number };

interface MapViewProps {
  /** 상위에서 내려주는 확정 장소 좌표 (없어도 됨). 약속 데이터가 있으면 그걸 우선 사용 */
  target?: TargetPin;
}

const MapView = ({ target }: MapViewProps) => {
  const { id } = useParams();
  const roomId = Number(id);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

  // 내 위치(커스텀 오버레이)
  const markerRef = useRef<any>(null);
  // 확정 장소(커스텀 오버레이로 동일하게)
  const targetMarkerRef = useRef<any>(null);

  const isInitializedRef = useRef<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [mapReady, setMapReady] = useState(false); // [ADD] 지도 준비 플래그
  const { rankingHeight, setMoveToCurrentLocation } = useMapStore();

  // 약속 상세 불러오기
  const { data: appointment } = useAppointment(roomId);

  // Kakao Maps API 로드 대기
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

  // 커스텀 마커 생성 함수(현재 위치/확정 위치 동일 사용)
  const createCustomMarker = (position: any, imgUrl?: string) => {
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
  };

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

    const kakao = window.kakao;
    const center = new kakao.maps.LatLng(lat, lng);

    mapRef.current = new kakao.maps.Map(mapContainerRef.current, {
      center,
      level: 3,
    });

    // 내 위치 마커(커스텀 오버레이)
    markerRef.current = createCustomMarker(center);
    markerRef.current.setMap(mapRef.current);

    // [REMOVED] 타겟 마커를 초기화 시점에 임의의 위치로 만들지 않음
    // targetMarkerRef.current = createCustomMarker(center);

    isInitializedRef.current = true;
    setIsLoading(false);
    setMapReady(true); // [ADD]
  }, []);

  // rankingHeight 변경 시 지도 크기 재조정
  useEffect(() => {
    if (mapRef.current && isInitializedRef.current) {
      setTimeout(() => {
        mapRef.current.relayout();
      }, 0);
    }
  }, [rankingHeight]);

  // 지도 세팅
  useEffect(() => {
    if (isInitializedRef.current) return;

    const setupMap = async () => {
      try {
        await waitForKakaoMaps();

        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition((position) => {
            initMap(position.coords.latitude, position.coords.longitude);
          }, () => {
            // [SAFE] 위치 실패 시 기본 좌표로라도 지도 생성
            initMap(37.5665, 126.978);
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
      if (targetMarkerRef.current) {
        targetMarkerRef.current.setMap(null);
        targetMarkerRef.current = null;
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

  // 확정 장소 마커(현재 위치와 같은 커스텀 오버레이로) 표시
  useEffect(() => {
    if (!mapReady || !mapRef.current) return; // [CHANGED] 지도 준비 후에만 수행

    const kakao = window.kakao;

    const latFromAppt = (appointment as AppointmentResponse | undefined)?.locationLat as
      | number
      | null
      | undefined;
    const lngFromAppt = (appointment as AppointmentResponse | undefined)?.locationLng as
      | number
      | null
      | undefined;

    // 숫자 보정
    const finalLat =
      typeof latFromAppt === 'number' && Number.isFinite(latFromAppt)
        ? latFromAppt
        : typeof target?.lat === 'number' && Number.isFinite(target.lat)
        ? target.lat
        : undefined;

    const finalLng =
      typeof lngFromAppt === 'number' && Number.isFinite(lngFromAppt)
        ? lngFromAppt
        : typeof target?.lng === 'number' && Number.isFinite(target.lng)
        ? target.lng
        : undefined;

    if (typeof finalLat === 'number' && typeof finalLng === 'number') {
      const pos = new kakao.maps.LatLng(finalLat, finalLng);

      if (!targetMarkerRef.current) {
        targetMarkerRef.current = createCustomMarker(pos);
        targetMarkerRef.current.setMap(mapRef.current);
      } else {
        targetMarkerRef.current.setPosition(pos);
        targetMarkerRef.current.setMap(mapRef.current);
      }

      // 필요하면 타겟으로 이동:
      // mapRef.current.panTo(pos);
    } else {
      // 정말로 "없다"로 확정될 때만 제거 (초기 로딩 중 null/undefined로 오는 경우엔 자연스레 다음 렌더에서 찍힘)
      if (targetMarkerRef.current) {
        targetMarkerRef.current.setMap(null);
        targetMarkerRef.current = null;
      }
    }
  }, [mapReady, appointment, target?.lat, target?.lng]);

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
