/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';

import type { AppointmentResponse } from '../../../../apis/room/room.types';
import Icon from '../../../../components/ui/Icon';

/** 깃발 + 클릭 시 라벨 팝업 */
function FlagWithTooltip({ label }: { label: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'flex-start', // 왼쪽 정렬
        lineHeight: 0,
        pointerEvents: 'auto',
      }}
    >
      {/* 라벨 팝업 */}
      {open && (
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
            border: '1px solid #eb793c',
            maxWidth: 220,
            wordBreak: 'break-word',
          }}
        >
          {label}
        </div>
      )}

      {/* 깃발 아이콘 (토글 버튼) */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        style={{
          all: 'unset',
          cursor: 'pointer',
          display: 'inline-flex',
        }}
        aria-label="도착지"
        title="도착지"
      >
        <Icon type="flag" size={35} />
      </button>
    </div>
  );
}

type Props = {
  map: any | null;
  ready: boolean;
  appointment: AppointmentResponse | null | undefined;
  centerOnCreate?: boolean;
};

const TargetMarker = ({ map, ready, appointment, centerOnCreate = true }: Props) => {
  const overlayRef = useRef<any>(null);
  const rootRef = useRef<Root | null>(null);

  const destroy = () => {
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

    // 좌표 없으면 제거
    if (!appointment?.locationLat || !appointment?.locationLng) {
      destroy();
      return;
    }

    if (!window.kakao || !window.kakao.maps?.LatLng) return;
    const kakao = window.kakao;
    const pos = new kakao.maps.LatLng(appointment.locationLat, appointment.locationLng);

    // 재생성
    destroy();

    const container = document.createElement('div');

    const root = createRoot(container);
    rootRef.current = root;

    const safeLabel = (appointment.locationName ?? '도착지')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // 깃발과 팝업을 리액트로 렌더링
    root.render(<FlagWithTooltip label={safeLabel} />);

    overlayRef.current = new kakao.maps.CustomOverlay({
      position: pos,
      content: container,
      xAnchor: 0, // 왼쪽 기준
      yAnchor: 1, // 하단 기준
      zIndex: 100,
    });
    overlayRef.current.setMap(map);

    if (centerOnCreate) map.setCenter(pos);

    return () => destroy();
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
