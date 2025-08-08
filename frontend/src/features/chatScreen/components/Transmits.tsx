// src/features/chat/components/Transmits.tsx
import { useRef, useState } from 'react';
import CircleBtn from '../../../components/ui/CircleBtn';
import Input from '../../../components/ui/Input';
import { useUploadChatImage } from '../../../hooks/chat';
import { useRoomStore } from '../../../stores/room.store';
import { useRoomUserStore } from '../../../stores/roomUser.store';

type Props = {
  // roomId를 부모에서 넘기더라도, 스토어에 있으면 스토어 값 우선 사용
  roomId?: number;
};

const Transmits = ({ roomId: roomIdProp }: Props) => {
  const [message, setMessage] = useState(''); // WS 붙일 때 사용 예정
  const [sending, setSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ✅ roomId: 스토어 우선 → prop fallback
  const currentRoomId = useRoomStore((s) => s.currentRoomId);
  const roomId = currentRoomId ?? roomIdProp ?? null;

  // ✅ roomUserId: 방별로 저장된 값 조회
  const roomUserId = useRoomUserStore((s) =>
    roomId != null ? s.getRoomUserId(roomId) : undefined,
  );

  // ✅ 업로드 mutation
  const { mutateAsync: uploadImage } = useUploadChatImage();

  const disabledByContext = roomId == null || roomUserId == null;

  const handlePickFile = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    e.target.value = ''; // 같은 파일 재선택 가능
    if (!file) return;

    if (disabledByContext) {
      alert('방 정보가 없어요. 방에 다시 입장해 주세요.');
      return;
    }

    try {
      setSending(true);

      // ❗️lat/lng 필수: 위치 권한 없으면 업로드 중단
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, (err) => reject(err), {
          enableHighAccuracy: true,
          timeout: 8000,
        }),
      );

      const latitude = pos.coords.latitude;
      const longitude = pos.coords.longitude;
      const sendDate = new Date().toISOString();

      // REST 업로드 호출
      const uploadResult = await uploadImage({
        file,
        latitude,
        longitude,
        sendDate,
      });

      if (!uploadResult || !uploadResult.imageUrl) {
        throw new Error('이미지 업로드 결과가 올바르지 않습니다.');
      }

      const { imageUrl } = uploadResult;

      // 👉 여기서 imageUrl 사용 (미리보기/알림/WS publish 등)
      console.log('업로드 성공:', { imageUrl, roomId, roomUserId });
    } catch (err) {
      console.error(err);
      alert('이미지 업로드 실패 또는 위치 권한이 필요합니다.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex items-center gap-5 px-1 bg-white rounded-xl">
      {/* 이미지 업로드 버튼 */}
      <CircleBtn
        iconType="camera"
        color="white"
        onClick={handlePickFile}
        className="shrink-0"
        disabled={sending || disabledByContext}
      />
      <input
        type="file"
        accept="image/*"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />

      {/* 텍스트 입력: 지금은 REST만, WS 붙일 때 활성화 */}
      <Input
        placeholder={
          disabledByContext ? '방 정보가 없어요' : '(실시간 전송은 추후 연결) 메시지를 입력하세요'
        }
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="bg-white flex-1"
        textSize="text-sm"
        disabled // WS 전송 붙일 때 해제
      />

      {/* 전송 버튼: WS 붙일 때 사용 */}
      <CircleBtn iconType="send" color="primary" onClick={() => {}} className="shrink-0" disabled />
    </div>
  );
};

export default Transmits;
