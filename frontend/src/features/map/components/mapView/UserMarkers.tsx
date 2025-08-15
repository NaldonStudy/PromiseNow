/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import type { PositionResponseDto } from '../../../../apis/leaderboard/leaderboard.types';
import type { DetailedInfoResponse } from '../../../../apis/room/roomuser.types';
import UserMarker from '../UserMaker';

type Props = {
  map: any | null;
  ready: boolean;
  myRoomUserId?: number;
  positions: PositionResponseDto[];
  detailedUsers: DetailedInfoResponse[];
};

const UserMarkers = ({ map, ready, myRoomUserId, positions, detailedUsers }: Props) => {
  const markersRef = useRef<Map<number, any>>(new Map());

  useEffect(() => {
    if (!ready || !map) return;
    if (!window.kakao || !window.kakao.maps?.LatLng) return;
    const kakao = window.kakao;

    const markers = markersRef.current;

    // 추가/업데이트
    positions.forEach((p) => {
      if (p.roomUserId === myRoomUserId) return; // 내 마커는 제외(부모에서 따로)

      const pos = new kakao.maps.LatLng(p.lat, p.lng);
      const existing = markers.get(p.roomUserId);

      // 유저 프로필
      const info = detailedUsers.find((u) => u.roomUserId === p.roomUserId);
      const imgUrl = info?.profileImage || undefined;

      if (existing) {
        existing.setPosition(pos);
      } else {
        const div = document.createElement('div');
        const root = createRoot(div);
        root.render(<UserMarker imgUrl={imgUrl} color="text-blue-500" />);

        const overlay = new kakao.maps.CustomOverlay({
          position: pos,
          content: div,
          yAnchor: 1,
          zIndex: 50,
        });
        overlay.setMap(map);
        markers.set(p.roomUserId, overlay);
      }
    });

    // 제거(오프라인)
    const onlineSet = new Set(positions.map((p) => p.roomUserId));
    [...markers.entries()].forEach(([rid, overlay]) => {
      if (!onlineSet.has(rid)) {
        overlay.setMap(null);
        markers.delete(rid);
      }
    });

    // 클린업 시 현재 스냅샷로 정리
    return () => {
      const snapshot = new Map(markersRef.current);
      snapshot.forEach((overlay) => overlay?.setMap(null));
      // 끊길 때 전부 지울 필요 없으면 위 줄 주석 처리
    };
  }, [ready, map, myRoomUserId, positions, detailedUsers]);

  return null;
};

export default UserMarkers;
