// src/features/chat/components/Transmits.tsx
import { useState, useRef, useEffect } from 'react';

import CameraPopCard from '../../../components/ui/CameraPopCard';
import CircleBtn from '../../../components/ui/CircleBtn';
import Input from '../../../components/ui/Input';

import { useUploadChatImage } from '../../../hooks/chat';
import { useRoomUserInfo } from '../../../hooks/queries/room';
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
  const [isComposing, setIsComposing] = useState(false); // 한글 입력 상태
  const inputRef = useRef<HTMLInputElement>(null);

  const { user } = useUserStore();
  const roomUserId = useRoomUserInfo(roomId, user?.userId || 0).data?.roomUserId;

  const { mutateAsync: uploadImage } = useUploadChatImage();

  const disabledByContext = roomId == null || roomUserId == null || !user?.userId;

  // 컴포넌트 마운트 시 입력창에 자동 포커스
  useEffect(() => {
    if (!disabledByContext && isConnected) {
      inputRef.current?.focus();
    }
  }, [disabledByContext, isConnected]);

  // 메시지 전송 후 포커스 유지
  useEffect(() => {
    if (message === '' && !sending && !disabledByContext && isConnected) {
      // 다음 프레임에서 포커스 설정 (리렌더링 완료 후)
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    }
  }, [message, sending, disabledByContext, isConnected]);

  const handlePickFile = () => setOpenPicker((v) => !v);

  const handleFileSelected = async (file: File) => {
    if (disabledByContext) {
      alert('방/사용자 정보가 없습니다. 다시 입장해 주세요.');
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
        lat: latitude,
        lng: longitude,
        sentDate,
      });

      if (!uploadResult.fileUrl) {
        throw new Error('이미지 업로드 결과가 올바르지 않습니다.');
      }

      if (isConnected) {
        sendMessage({
          roomId,
          roomUserId,
          userId: user?.userId || 0,
          type: 'IMAGE',
          content: '이미지',
          imageUrl: uploadResult.fileUrl,
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
    if (!message.trim() || disabledByContext || sending) return;
    
    const messageToSend = message.trim();
    setSending(true);
    
    const sentDate = new Date().toISOString();

    if (isConnected) {
      sendMessage({
        roomId,
        roomUserId,
        userId: user?.userId || 0,
        type: 'TEXT',
        content: messageToSend,
        imageUrl: null,
        lat: null,
        lng: null,
        sentDate,
      });
    }
    
    // 메시지 전송 후 입력창 초기화
    setMessage('');
    setSending(false);
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
        ref={inputRef}
        placeholder={disabledByContext ? '방/사용자 정보가 없어요' : '메시지를 입력하세요'}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="bg-white flex-1"
        textSize="text-sm"
        disabled={disabledByContext || sending || !isConnected}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !isComposing) {
            e.preventDefault(); // 기본 동작 방지 (포커스 이동 등)
            handleSendText();
          }
        }}
        onCompositionStart={() => setIsComposing(true)}
        onCompositionEnd={() => setIsComposing(false)}
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
