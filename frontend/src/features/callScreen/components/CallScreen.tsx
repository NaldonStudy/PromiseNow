import { useEffect, useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMediasoupClient } from '../../../hooks/webrtc/useMediasoupClient';
import { useCallActionStore } from '../callAction';
import { useUserStore } from '../../../stores/user.store';

import CallControlPanel from './CallControlPanel';
import VideoGrid from './VideoGrid';

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
  const { user } = useUserStore();
  const userId = user?.userId;
  const hasConnected = useRef(false);

  const {
    isConnected,
    isConnecting,
    error,
    peers,
    peerStreams,
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
    userId: userId !== undefined ? String(userId) : 'unknown',
    displayName: 'Anonymous',
    produce: true,
    consume: true,
    mic: false,
    webcam: false,
  });

  const requestLeave = useCallActionStore((s) => s.requestLeave);
  const resetLeave = useCallActionStore((s) => s.reset);

  useEffect(() => {
    if (id && !hasConnected.current) {
      hasConnected.current = true;
      connect();
    }
  }, [id, connect]);

  useEffect(() => {
    if (requestLeave) {
      handleLeaveCall();
      resetLeave();
    }
  }, [requestLeave, resetLeave]);

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
    if (!micProducer) {
      await enableMic();
      return;
    }
    if (micProducer.paused) await unmuteMic();
    else await muteMic();
  };

  const handleToggleVideo = async () => {
    if (!webcamProducer) {
      await enableWebcam();
      return;
    }
    if (webcamProducer.paused) await unmuteWebcam();
    else await muteWebcam();
  };

  const participants: Participant[] = useMemo(() => {
    const list: Participant[] = [];

    const items = Array.from(peers.values()).sort((a, b) => {
      if (a.isSelf && !b.isSelf) return -1;
      if (!a.isSelf && b.isSelf) return 1;
      return (a.joinedAt ?? 0) - (b.joinedAt ?? 0);
    });

    items.forEach((peer) => {
      const stream = peerStreams.get(peer.id) ?? null;

      const getHasRenderable = (s: MediaStream | null, kind: 'audio' | 'video') => {
        if (!s || !s.active) return false;
        const track = kind === 'audio' ? s.getAudioTracks()[0] : s.getVideoTracks()[0];
        return !!track && track.readyState === 'live' && !track.muted;
      };

      const isLocal = peer.isSelf;

      const hasRemoteAudio = getHasRenderable(stream, 'audio');
      const hasRemoteVideo = getHasRenderable(stream, 'video');

      const micMuted = isLocal ? (!micProducer ? true : !!micProducer.paused) : !hasRemoteAudio;
      const camMuted = isLocal
        ? !webcamProducer
          ? true
          : !!webcamProducer.paused
        : !hasRemoteVideo;

      list.push({
        id: peer.id,
        name: isLocal ? '나' : peer.displayName || `참가자 ${peer.id.slice(0, 8)}`,
        isOnline: true,
        isMicMuted: micMuted,
        isVideoMuted: camMuted,
        videoStream: stream,
      });
    });

    return list;
  }, [
    peers,
    peerStreams,
    micProducer,
    webcamProducer,
    micProducer?.paused,
    webcamProducer?.paused,
  ]);

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
        onEnableMic={enableMic}
        onEnableVideo={enableWebcam}
        micProducer={micProducer}
        webcamProducer={webcamProducer}
        isMicMuted={!micProducer || !!micProducer.paused}
        isVideoMuted={!webcamProducer || !!webcamProducer.paused}
        isConnected={isConnected}
      />
    </div>
  );
};

export default CallScreen;
