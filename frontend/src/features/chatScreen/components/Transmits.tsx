// src/features/chat/components/Transmits.tsx
import { useState } from 'react';

import CircleBtn from '../../../components/ui/CircleBtn';
import Input from '../../../components/ui/Input';
import CameraPopCard from './CameraPopCard';

import { useUploadChatImage } from '../../../hooks/chat';
import { useRoomUserStore } from '../../../stores/roomUser.store';
import { useUserStore } from '../../../stores/user.store';

type Props = {
  roomId: number;
  isConnected: boolean;
  sendMessage: (body: Record<string, unknown>) => void;
};

const Transmits = ({ roomId, isConnected, sendMessage }: Props) => {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [openPicker, setOpenPicker] = useState(false);

  const { userId } = useUserStore(); // ✅ DTO 요구 필드
  const roomUserId = useRoomUserStore((s) =>
    roomId != null ? s.getRoomUserId(roomId) : undefined,
  );

  const { mutateAsync: uploadImage } = useUploadChatImage();

  const disabledByContext = roomId == null || roomUserId == null || userId == null;

  const handlePickFile = () => setOpenPicker((v) => !v);

  const handleFileSelected = async (file: File) => {
    if (disabledByContext) {
      alert('방/사용자 정보가 없습니다. 다시 입장해 주세요.');
      return;
    }

    try {
      setSending(true);

      // 위치 정보 (옵션)
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 8000,
        }),
      );

      const latitude = pos.coords.latitude;
      const longitude = pos.coords.longitude;
      const sentDate = new Date().toISOString();

      const uploadResult = await uploadImage({
        file,
        latitude,
        longitude,
        sentDate,
      });

      if (!uploadResult?.imageUrl) {
        throw new Error('이미지 업로드 결과가 올바르지 않습니다.');
      }

      if (isConnected) {
        // ✅ 서버 MessageRequestDto 스펙에 맞춰 전송
        sendMessage({
          roomId,
          roomUserId,
          userId, // ← 누락되기 쉬움
          type: 'IMAGE',
          content: '이미지',
          imageUrl: uploadResult.imageUrl,
          lat: latitude,
          lng: longitude,
          sentDate,
        });
      }
    } catch (err) {
      console.error(err);
      alert('이미지 업로드 실패 또는 위치 권한이 필요합니다.');
    } finally {
      setSending(false);
      setOpenPicker(false);
    }
  };

  const handleSendText = () => {
    if (!message.trim() || disabledByContext) return;
    const sentDate = new Date().toISOString();

    if (isConnected) {
      // ✅ TEXT 전송도 DTO 스펙에 맞춰
      sendMessage({
        roomId,
        roomUserId,
        userId, // ← 추가
        type: 'TEXT',
        content: message.trim(),
        imageUrl: null,
        lat: null,
        lng: null,
        sentDate,
      });
      setMessage('');
    }
  };

  return (
    <div className="flex items-center gap-5 px-1 bg-white rounded-xl relative">
      <div className="relative">
        <CircleBtn
          iconType="camera"
          color="white"
          onClick={handlePickFile}
          className="shrink-0"
          disabled={sending || disabledByContext || !isConnected}
        />
        {openPicker && (
          <CameraPopCard
            onSelect={handleFileSelected}
            onClose={() => setOpenPicker(false)}
            disabled={sending || disabledByContext || !isConnected}
          />
        )}
      </div>

      <Input
        placeholder={disabledByContext ? '방/사용자 정보가 없어요' : '메시지를 입력하세요'}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="bg-white flex-1"
        textSize="text-sm"
        disabled={disabledByContext || sending || !isConnected}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSendText();
        }}
      />

      <CircleBtn
        iconType="send"
        color="primary"
        onClick={handleSendText}
        className="shrink-0"
        disabled={disabledByContext || !message.trim() || sending || !isConnected}
      />
    </div>
  );
};

export default Transmits;
