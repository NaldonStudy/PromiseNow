import { useMemo, useRef, useEffect } from 'react';
import Profile from '../../../components/ui/Profile';
import Icon from '../../../components/ui/Icon';
import { useMeStore } from '../../../hooks/webrtc/stores/me';

interface Props {
  id: string;
  name: string;
  isOnline: boolean;
  isMicMuted: boolean;
  isVideoMuted: boolean;
  videoStream: MediaStream | null;
  onClick?: (id: string) => void;
}

const VideoTile = ({ id, name, isOnline, videoStream, onClick }: Props) => {
  const { audioMuted, videoMuted } = useMeStore();

  const videoRef = useRef<HTMLVideoElement>(null);
  const bgColors = useMemo(() => ['bg-gray', 'bg-gray-input', 'bg-gray-input/10'], []);
  const randomBg = useMemo(() => {
    return bgColors[Math.floor(Math.random() * bgColors.length)];
  }, [bgColors]);

  // 미디어 스트림 연결
  useEffect(() => {
    if (videoRef.current && videoStream) {
      videoRef.current.srcObject = videoStream;
    }
  }, [videoStream]);

  const handleClick = () => {
    if (onClick) {
      onClick(id);
    }
  };

  return (
    <div className={`relative h-full overflow-hidden cursor-pointer`} onClick={handleClick}>
      {!videoMuted ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={true}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <div className={`flex items-center justify-center h-full ${randomBg}`}>
          <div className="text-center">
            <div className="flex items-center justify-center mx-auto mb-2">
              <Profile width="w-15" iconSize={27} />
            </div>
          </div>
        </div>
      )}

      {/* 사용자 정보 */}
      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
        <span className="bg-opacity-50 text-text-dark text-xs px-2 py-1 rounded flex justify-center items-center">
          {name}
          {audioMuted && (
            <div className="bg-opacity-50 p-1 rounded">
              <Icon type="micOff" size={13} />
            </div>
          )}
          {videoMuted && (
            <div className="bg-opacity-50 p-1 rounded">
              <Icon type="videoOff" size={13} />
            </div>
          )}
        </span>
      </div>

      {/* 오프라인 여부 */}
      {!isOnline && (
        <div className="absolute bg-text-dark/20 bottom-0 left-0 h-full w-full">
          <div className="flex items-center justify-center h-full">
            <span className="text-sm bg-white rounded-full text-text-light font-bold px-6 py-0.5">
              Offline
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoTile;
