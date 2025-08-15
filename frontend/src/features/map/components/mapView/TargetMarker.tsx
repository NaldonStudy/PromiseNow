/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';

import type { AppointmentResponse } from '../../../../apis/room/room.types';
import Icon from '../../../../components/ui/Icon';

type Props = {
  map: any | null;
  ready: boolean;
  appointment: AppointmentResponse | null | undefined;
  centerOnCreate?: boolean;
};

// 내부에 렌더링할 작은 컴포넌트 (아이콘 클릭 → 말풍선 토글)
const FlagMarkerContent = ({ label, size = 35 }: { label?: string; size?: number }) => {
  const [open, setOpen] = useState(false);

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        setOpen((v) => !v);
      }}
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        lineHeight: 0,
        pointerEvents: 'auto', // 클릭 가능
        cursor: 'pointer',
      }}
    >
      {open && label && (
        <div
          style={{
            marginBottom: 6,
            padding: '10px 10px',
            borderRadius: 4,
            background: '#fff',
            color: '#eb793c',
            fontSize: 12,
            fontWeight: 600,
            boxShadow: '0 6px 16px rgba(0,0,0,.15)',
            border: ' 1px solid #eb793c',
          }}
        >
          {label}
        </div>
      )}
      <Icon type="flag" size={size} />
    </div>
  );
};

const TargetMarker = ({ map, ready, appointment, centerOnCreate = true }: Props) => {
  const overlayRef = useRef<any>(null);
  const rootRef = useRef<Root | null>(null);

  const destroyOverlay = () => {
    if (overlayRef.current) {
      overlayRef.current.setMap(null);
      overlayRef.current = null;
    }
    if (rootRef.current) {
      rootRef.current.unmount();
      rootRef.current = null;
    }
  };

  useEffect(() => {
    if (!ready || !map) return;

    if (!appointment?.locationLat || !appointment?.locationLng) {
      destroyOverlay();
      return;
    }

    if (!window.kakao || !window.kakao.maps?.LatLng) return;
    const kakao = window.kakao;
    const pos = new kakao.maps.LatLng(appointment.locationLat, appointment.locationLng);

    // 재생성
    destroyOverlay();

    const container = document.createElement('div');
    // 클릭 먹히도록 auto
    container.style.pointerEvents = 'auto';
    container.style.display = 'inline-flex';

    const root = createRoot(container);
    rootRef.current = root;
    root.render(<FlagMarkerContent label={appointment.locationName} size={35} />);

    overlayRef.current = new kakao.maps.CustomOverlay({
      position: pos,
      content: container,
      xAnchor: 0, // 좌
      yAnchor: 1, // 하
      zIndex: 100,
      clickable: true, // (옵션) 오버레이 클릭 이벤트 허용
    });
    overlayRef.current.setMap(map);

    if (centerOnCreate) map.setCenter(pos);

    return () => {
      destroyOverlay();
    };
  }, [
    ready,
    map,
    appointment?.locationLat,
    appointment?.locationLng,
    appointment?.locationName,
    centerOnCreate,
  ]);

  return null;
};

export default TargetMarker;
