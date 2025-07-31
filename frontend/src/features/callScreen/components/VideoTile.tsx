import { useMemo } from 'react';
import Profile from '../../../components/ui/Profile';
import Icon from '../../../components/ui/Icon';

interface Props {
  name: string;
  isOnline: boolean;
  isMuted: boolean;
  videoStream: MediaStream | null;
}

const VideoTile = ({ name, isOnline, isMuted, videoStream }: Props) => {
  const bgColors = ['bg-gray', 'bg-gray-input', 'bg-gray-input/10'];
  const getRandomColor = () => {
    return bgColors[Math.floor(Math.random() * bgColors.length)];
  };
  const randomBg = useMemo(() => getRandomColor(), []);

  return (
    <div className="relative h-full overflow-hidden">
      {videoStream ? (
        <video />
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
          {isMuted && (
            <div className="bg-opacity-50 p-1 rounded">
              <Icon type="micOff" size={13} />
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
