import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CallControlPanel from './CallControlPanel';
import VideoGrid from './VideoGrid';
import { useWebRTCConnection } from '../../../hooks/webrtc/useWebRTCConnection';

interface Participant {
  id: string;
  name: string;
  isOnline: boolean;
  isMuted: boolean;
  videoStream: MediaStream | null;
}

const CallScreen = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [participants, setParticipants] = useState<Participant[]>([]);

  const {
    isConnected,
    isConnecting,
    error,
    localStream,
    remoteStreams,
    connect,
    disconnect,
    enableAudio,
    enableVideo,
  } = useWebRTCConnection({
    roomId: id || '1',
    onPeerJoined: (peerId: string) => {
      console.log('새로운 참가자:', peerId);
      // 새로운 참가자 추가 로직
    },
    onPeerLeft: (peerId: string) => {
      console.log('참가자 퇴장:', peerId);
      // 참가자 제거 로직
    },
  });

  // WebRTC 연결 및 미디어 활성화
  useEffect(() => {
    if (id) {
      connect();
    }
  }, [id, connect]);

  // 연결 성공 시 미디어 활성화
  useEffect(() => {
    if (isConnected) {
      enableAudio();
      enableVideo();
    }
  }, [isConnected, enableAudio, enableVideo]);

  // 로컬 스트림을 참가자 목록에 추가
  useEffect(() => {
    if (localStream) {
      setParticipants(prev => {
        const existingLocal = prev.find(p => p.id === 'local');
        if (existingLocal) {
          return prev.map(p => 
            p.id === 'local' 
              ? { ...p, videoStream: localStream, isOnline: true }
              : p
          );
        } else {
          return [...prev, {
            id: 'local',
            name: '나',
            isOnline: true,
            isMuted: false,
            videoStream: localStream,
          }];
        }
      });
    }
  }, [localStream]);

  // 원격 스트림들을 참가자 목록에 추가
  useEffect(() => {
    remoteStreams.forEach((stream, peerId) => {
      setParticipants(prev => {
        const existing = prev.find(p => p.id === peerId);
        if (existing) {
          return prev.map(p => 
            p.id === peerId 
              ? { ...p, videoStream: stream, isOnline: true }
              : p
          );
        } else {
          return [...prev, {
            id: peerId,
            name: `참가자 ${peerId.slice(0, 8)}`,
            isOnline: true,
            isMuted: false,
            videoStream: stream,
          }];
        }
      });
    });
  }, [remoteStreams]);

  const handleChatClick = () => {
    if (!id) return;
    navigate(`/${id}/chat`);
  };

  const handleLeaveCall = () => {
    disconnect();
    navigate('/');
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-red-500 mb-4">연결 오류: {error}</p>
          <button 
            onClick={() => connect()}
            className="px-4 py-2 bg-blue-500 text-white rounded"
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
          <p className="mb-4">WebRTC 연결 중...</p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full">
      <VideoGrid participants={participants} />
      <CallControlPanel 
        onClick={handleChatClick} 
        onLeaveCall={handleLeaveCall}
        isConnected={isConnected}
      />
    </div>
  );
};

export default CallScreen;
