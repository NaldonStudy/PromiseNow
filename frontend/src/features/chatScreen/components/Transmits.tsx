import { Client } from '@stomp/stompjs';
import { useRef, useState } from 'react';
import CircleBtn from './../../../components/ui/CircleBtn';
import Input from './../../../components/ui/Input';

interface Props {
  roomId: number;
  stompClient: Client | null;
}

const Transmits = ({ roomId, stompClient }: Props) => {
  const [message, setMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 임시 사용자 정보 (나중에 로그인 유저에서 가져올 것)
  const userId = 7;
  const roomUserId = 101;

  const sendTextMessage = () => {
    if (!message.trim() || !stompClient?.connected) return;

    const body = {
      roomUserId,
      roomId,
      userId,
      content: message,
      type: 'TEXT',
      sendDate: new Date().toISOString(),
    };

    stompClient.publish({
      destination: `app/chat/${roomId}`,
      body: JSON.stringify(body),
    });

    setMessage('');
  };

  const handleImageUpload = async (file: File) => {
    if (!navigator.geolocation) {
      alert('이 브라우저는 위치 정보를 지원하지 않습니다.');
      return;
    }

    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;

      const formData = new FormData();
      formData.append('file', file);
      formData.append('lat', latitude.toString());
      formData.append('lng', longitude.toString());
      formData.append('timestamp', new Date().toString());

      try {
        const res = await fetch('http://localhost:8080/api/chatting/upload/image', {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) throw new Error('이미지 업로드 실패');

        const { imageUrl } = await res.json();

        const body = {
          roomUserId,
          roomId,
          userId,
          content: '이미지',
          type: 'IMAGE',
          imageUrl,
          lat: latitude,
          lng: longitude,
          sendDate: new Date().toISOString(),
          timestamp: new Date().toISOString(),
        };

        stompClient?.publish({
          destination: `/app/chat/${roomId}`,
          body: JSON.stringify(body),
        });
      } catch {
        alert('이미지 업로드 실패');
      }
    });
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') sendTextMessage();
  };

  return (
    <div className="flex items-center gap-5 px-1 bg-white rounded-xl">
      {/* 이미지 전송 버튼 */}
      <CircleBtn
        iconType="camera"
        color="white"
        onClick={() => fileInputRef.current?.click()}
        className="shrink-0"
      />
      <input
        type="file"
        accept="image/*"
        className="hidden"
        ref={fileInputRef}
        onChange={(e) => {
          if (e.target.files?.[0]) {
            handleImageUpload(e.target.files[0]);
            e.target.value = ''; // 같은 파일 다시 선택 가능
          }
        }}
      />

      {/* 텍스트 입력창 */}
      <Input
        placeholder="메세지를 작성하세요"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={onKeyDown}
        className="bg-white flex-1"
        textSize="text-sm"
      />

      {/* 전송 버튼 */}
      <CircleBtn iconType="send" color="primary" onClick={sendTextMessage} className="shrink-0" />
    </div>
  );
};

export default Transmits;
