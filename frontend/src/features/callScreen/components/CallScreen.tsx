import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMediasoupClient } from '../../../hooks/webrtc/useMediasoupClient';

import CallControlPanel from './CallControlPanel';
import VideoGrid from './VideoGrid';
import { useCallActionStore } from '../callAction';

interface Participant {
  id: string;
  name: string;
  isOnline: boolean;
  isMicMuted: boolean;
  isVideoMuted: boolean;
  videoStream: MediaStream | null;
}

const CallScreen = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const hasConnected = useRef(false);

  const {
    isConnected,
    isConnecting,
    error,
    localStream,
    remoteStreams,
    micProducer,
    webcamProducer,
    connect,
    disconnect,
    enableMic,
    enableWebcam,
    muteMic,
    unmuteMic,
    muteWebcam,
    unmuteWebcam,
  } = useMediasoupClient({
    roomId: id || '1',
    displayName: 'Anonymous',
    produce: true,
    consume: true,
    mic: true,
    webcam: true,
  });

  const requestLeave = useCallActionStore((s) => s.requestLeave);
  const resetLeave = useCallActionStore((s) => s.reset);

  // Mediasoup 연결 (한 번만 실행)
  useEffect(() => {
    if (id && !hasConnected.current) {
      hasConnected.current = true;
      connect();
    }
  }, [id]); // connect 제거

  // 연결 성공 시 미디어 활성화
  useEffect(() => {
    if (isConnected) {
      console.log('Connection successful, enabling media...');
      enableMic();
      enableWebcam();
    }
  }, [isConnected, enableMic, enableWebcam]);

  // 로컬 스트림을 참가자 목록에 추가
  useEffect(() => {
    if (localStream) {
      setParticipants((prev) => {
        const existingLocal = prev.find((p) => p.id === 'local');
        // webcamProducer가 아직 없으면 isVideoMuted를 false로 간주
        const isVideoMuted = webcamProducer ? webcamProducer.paused : false;
        const isMicMuted = micProducer ? micProducer.paused : false;
        if (existingLocal) {
          return prev.map((p) =>
            p.id === 'local'
              ? { ...p, videoStream: localStream, isOnline: true, isMicMuted, isVideoMuted }
              : p,
          );
        } else {
          return [
            ...prev,
            {
              id: 'local',
              name: '나',
              isOnline: true,
              isMicMuted,
              isVideoMuted,
              videoStream: localStream,
            },
          ];
        }
      });
    }
  }, [localStream, micProducer, webcamProducer]);

  // 원격 스트림들을 참가자 목록에 추가
  useEffect(() => {
    remoteStreams.forEach((stream, peerId) => {
      setParticipants((prev) => {
        const existing = prev.find((p) => p.id === peerId);
        if (existing) {
          return prev.map((p) =>
            p.id === peerId ? { ...p, videoStream: stream, isOnline: true } : p,
          );
        } else {
          return [
            ...prev,
            {
              id: peerId,
              name: `참가자 ${peerId.slice(0, 8)}`,
              isOnline: true,
              isMicMuted: false,
              isVideoMuted: false,
              videoStream: stream,
            },
          ];
        }
      });
    });
  }, [remoteStreams]);

  useEffect(() => {
    if (requestLeave) {
      handleLeaveCall();
      resetLeave();
    }
  }, [requestLeave]);

  const handleChatClick = () => {
    if (!id) return;
    navigate(`/${id}/chat`);
  };

  const handleLeaveCall = () => {
    hasConnected.current = false;
    disconnect();
    navigate(`/${id}/schedule`);
  };

  const handleToggleMic = async () => {
    if (micProducer && micProducer.paused) {
      await unmuteMic();
    } else {
      await muteMic();
    }
  };

  const handleToggleVideo = async () => {
    if (webcamProducer && webcamProducer.paused) {
      await unmuteWebcam();
    } else {
      await muteWebcam();
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-red-500 mb-4">연결 오류: {error}</p>
          <button
            onClick={() => {
              hasConnected.current = false;
              connect();
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            재연결
          </button>
        </div>
      </div>
    );
  }

  if (isConnecting) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="mb-4">Mediasoup 연결 중...</p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full bg-gray-200">
      <VideoGrid participants={participants} />
      <CallControlPanel
        onClick={handleChatClick}
        onToggleMic={handleToggleMic}
        onToggleVideo={handleToggleVideo}
        isConnected={isConnected}
        isMicMuted={micProducer?.paused || false}
        isVideoMuted={webcamProducer?.paused || false}
      />
    </div>
  );
};

export default CallScreen;
