// src/features/map/components/MapControls.tsx
import { useState } from 'react';

import CameraPopCard from '../../../components/ui/CameraPopCard';
import CircleBtn from '../../../components/ui/CircleBtn';

import { useChatPublish } from '../../../hooks/socket/useChatPublish'; // ← 생성한 보조 훅
import useMapStore from '../map.store';

type Props = {
  roomId: number; // ← 반드시 전달 필요
};

const MapControls = ({ roomId }: Props) => {
  const { rankingHeight, moveToCurrentLocation } = useMapStore();

  // 카메라 팝오버 열기 상태
  const [openPicker, setOpenPicker] = useState(false);
  const [busy, setBusy] = useState(false);

  // 채팅으로 전송 (재사용 훅)
  const { isConnected, canSend, sendImage } = useChatPublish(roomId);

  const handleMyLocationClick = () => {
    if (moveToCurrentLocation) moveToCurrentLocation();
  };

  // CameraPopCard에서 파일 선택/촬영 완료 시 호출
  const handleFileSelected = async (file: File) => {
    try {
      setBusy(true);
      await sendImage(file);
    } catch {
      alert('이미지 업로드 실패 또는 위치 권한 허용 필요');
    } finally {
      setBusy(false);
      setOpenPicker(false);
    }
  };

  const disabled = !isConnected || !canSend || busy;

  return (
    <div
      className="absolute left-0 right-0 flex justify-between px-6 z-50"
      style={{ bottom: `${rankingHeight + 20}px` }}
    >
      {/* 카메라 버튼 + 팝카드 (Transmits와 동일한 UX) */}
      <div className="relative">
        <CircleBtn
          iconType="camera"
          color="white"
          disabled={disabled}
          onClick={() => setOpenPicker((v) => !v)}
        />
        {openPicker && (
          <CameraPopCard
            onSelect={handleFileSelected}
            onClose={() => setOpenPicker(false)}
            disabled={disabled}
          />
        )}
      </div>

      {/* 내 위치 이동 버튼 */}
      <CircleBtn iconType="myLocation" color="white" onClick={handleMyLocationClick} />
    </div>
  );
};

export default MapControls;
