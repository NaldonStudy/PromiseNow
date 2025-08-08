// src/features/chat/components/Transmits.tsx
import type { Client } from '@stomp/stompjs';
import { useState } from 'react';

import CircleBtn from '../../../components/ui/CircleBtn';
import Input from '../../../components/ui/Input';
import CameraPopCard from './CameraPopCard';

import { useUploadChatImage } from '../../../hooks/chat';
import { useRoomStore } from '../../../stores/room.store';
import { useRoomUserStore } from '../../../stores/roomUser.store';

type Props = {
  // roomId를 부모에서 넘기더라도, 스토어에 있으면 스토어 값 우선 사용
  roomId?: number;
  stompClient?: Client | null; // WS 붙일 때 사용 예정
};

const Transmits = ({ roomId: roomIdProp, stompClient }: Props) => {
  const [message, setMessage] = useState(''); // WS 붙일 때 사용 예정
  const [sending, setSending] = useState(false);
  const [openPicker, setOpenPicker] = useState(false);

  // roomId: 스토어 우선 → prop fallback
  const currentRoomId = useRoomStore((s) => s.currentRoomId);
  const roomId = currentRoomId ?? roomIdProp ?? null;

  // roomUserId: 방별로 저장된 값 조회
  const roomUserId = useRoomUserStore((s) =>
    roomId != null ? s.getRoomUserId(roomId) : undefined,
  );

  // 업로드 mutation
  const { mutateAsync: uploadImage } = useUploadChatImage();

  const disabledByContext = roomId == null || roomUserId == null;

  const handlePickFile = () => setOpenPicker((v) => !v);

  const handleFileSelected = async (file: File) => {
    if (disabledByContext) {
      alert('방 정보가 없어요. 방에 다시 입장해 주세요.');
      return;
    }

    try {
      setSending(true);

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

      if (!uploadResult || !uploadResult.imageUrl) {
        throw new Error('이미지 업로드 결과가 올바르지 않습니다.');
      }

      if (stompClient && stompClient.connected) {
        stompClient.publish({
          destination: '/app/chat',
          body: JSON.stringify({
            roomId,
            roomUserId,
            type: 'IMAGE',
            content: '이미지',
            imageUrl: uploadResult.imageUrl,
            lat: latitude,
            lng: longitude,
            sentDate,
          }),
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

    if (stompClient && stompClient.connected) {
      stompClient.publish({
        destination: '/app/chat',
        body: JSON.stringify({
          roomId,
          roomUserId,
          type: 'TEXT',
          content: message.trim(),
          sentDate,
        }),
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
          disabled={sending || disabledByContext}
        />
        {openPicker && (
          <CameraPopCard
            onSelect={handleFileSelected}
            onClose={() => setOpenPicker(false)}
            disabled={sending || disabledByContext}
          />
        )}
      </div>

      <Input
        placeholder={disabledByContext ? '방 정보가 없어요' : '메시지를 입력하세요'}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="bg-white flex-1"
        textSize="text-sm"
        disabled={disabledByContext || sending}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSendText();
        }}
      />

      <CircleBtn
        iconType="send"
        color="primary"
        onClick={handleSendText}
        className="shrink-0"
        disabled={disabledByContext || !message.trim() || sending}
      />
    </div>
  );
};

export default Transmits;
