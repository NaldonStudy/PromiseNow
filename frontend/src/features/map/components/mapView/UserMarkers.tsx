/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useCallback } from 'react';
import { createRoot } from 'react-dom/client';

import type { PositionResponseDto } from '../../../../apis/leaderboard/leaderboard.types';
import type { DetailedInfoResponse } from '../../../../apis/room/roomuser.types';
import UserMarker from '../UserMaker';

type Props = {
  map: any | null;
  ready: boolean;
  positions: PositionResponseDto[];
  detailedUsers: DetailedInfoResponse[];
  myRoomUserId?: number;
};

const UserMarkers = ({ map, ready, positions, detailedUsers, myRoomUserId }: Props) => {
  const markersRef = useRef<Map<number, any>>(new Map());

  const createUserMarker = useCallback(
    (position: any, imgUrl?: string) => {
      if (!map || !window.kakao || !window.kakao.maps?.LatLng) return null;
      const kakao = window.kakao;

      const el = document.createElement('div');
      const root = createRoot(el);
      root.render(<UserMarker imgUrl={imgUrl} color="text-blue-500" />);

      const overlay = new kakao.maps.CustomOverlay({
        position,
        content: el,
        yAnchor: 1,
      });

      overlay.setMap(map);
      return overlay;
    },
    [map],
  );

  useEffect(() => {
    if (!ready || !map || !window.kakao || !window.kakao.maps?.LatLng) return;
    const kakao = window.kakao;

    // 로컬 참조 캡처 (cleanup 경고 방지)
    const markers = markersRef.current;

    // 생성/업데이트
    positions.forEach((p) => {
      if (myRoomUserId && p.roomUserId === myRoomUserId) return; // 내 마커 제외
      const pos = new kakao.maps.LatLng(p.lat, p.lng);

      // 유저 프로필 이미지 조회
      const info = detailedUsers.find((u) => u.roomUserId === p.roomUserId);
      const img = info?.profileImage || undefined;

      if (markers.has(p.roomUserId)) {
        const m = markers.get(p.roomUserId);
        m?.setPosition(pos);
      } else {
        const m = createUserMarker(pos, img);
        if (m) markers.set(p.roomUserId, m);
      }
    });

    // 오프라인 제거
    const onlineIds = new Set(positions.map((p) => p.roomUserId));
    markers.forEach((marker, id) => {
      if (!onlineIds.has(id)) {
        marker.setMap(null);
        markers.delete(id);
      }
    });

    return () => {
      // effect마다 깨끗이 정리
      markers.forEach((m) => m?.setMap(null));
      markers.clear();
    };
  }, [ready, map, positions, detailedUsers, myRoomUserId, createUserMarker]);

  return null;
};

export default UserMarkers;
