import { useMemo, useRef, useEffect, useState } from 'react';

import Profile from '../../../components/ui/Profile';
import Icon from '../../../components/ui/Icon';

interface Props {
  id: string;
  name: string;
  isOnline: boolean;
  isMicMuted: boolean;
  isVideoMuted: boolean;
  videoStream: MediaStream | null;
  onClick?: (id: string) => void;
}

const VideoTile = ({ id, isOnline, isMicMuted, isVideoMuted, videoStream, onClick }: Props) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [tick, setTick] = useState(0);

  const bgColors = useMemo(() => ['bg-gray', 'bg-gray-input', 'bg-gray-input/10'], []);
  const randomBg = useMemo(() => bgColors[Math.floor(Math.random() * bgColors.length)], [bgColors]);

  const vTrack = videoStream?.getVideoTracks()[0] || null;
  const aTrack = videoStream?.getAudioTracks()[0] || null;

  const vLive = !!vTrack && vTrack.readyState === 'live' && !vTrack.muted;
  const aLive = !!aTrack && aTrack.readyState === 'live' && !aTrack.muted;

  const showVideo = !isVideoMuted && !!videoStream && videoStream.active && vLive;

  useEffect(() => {
    if (!vTrack && !aTrack) return;
    const bump = () => setTick((x) => x + 1);
    vTrack?.addEventListener('mute', bump);
    vTrack?.addEventListener('unmute', bump);
    vTrack?.addEventListener('ended', bump);
    aTrack?.addEventListener('mute', bump);
    aTrack?.addEventListener('unmute', bump);
    aTrack?.addEventListener('ended', bump);
    return () => {
      vTrack?.removeEventListener('mute', bump);
      vTrack?.removeEventListener('unmute', bump);
      vTrack?.removeEventListener('ended', bump);
      aTrack?.removeEventListener('mute', bump);
      aTrack?.removeEventListener('unmute', bump);
      aTrack?.removeEventListener('ended', bump);
    };
  }, [vTrack, aTrack]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (showVideo && videoStream) {
      if (el.srcObject !== videoStream) el.srcObject = videoStream;
    } else {
      if (el.srcObject) el.srcObject = null;
    }
  }, [videoStream, showVideo, tick]);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;

    if (id !== 'local' && aLive && !showVideo && videoStream) {
      if (el.srcObject !== videoStream) el.srcObject = videoStream;
      el.play().catch(() => {});
    } else {
      if (el.srcObject) el.srcObject = null;
    }
  }, [id, aLive, showVideo, videoStream, tick]);

  const micOff = isMicMuted || !aLive;
  const camOff = isVideoMuted || !vLive;

  const handleClick = () => onClick?.(id);

  return (
    <div className="relative h-full overflow-hidden cursor-pointer" onClick={handleClick}>
      {showVideo ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={id === 'local'}
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

      <audio
        ref={audioRef}
        autoPlay
        playsInline
        muted={id === 'local'}
        style={{ display: 'none' }}
      />

      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
        <span className="bg-opacity-50 text-text-dark text-xs px-2 py-1 rounded flex justify-center items-center">
          {micOff && (
            <div className="bg-opacity-50 p-1 rounded">
              <Icon type="micOff" size={13} />
            </div>
          )}
          {camOff && (
            <div className="bg-opacity-50 p-1 rounded">
              <Icon type="videoOff" size={13} />
            </div>
          )}
        </span>
      </div>

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
