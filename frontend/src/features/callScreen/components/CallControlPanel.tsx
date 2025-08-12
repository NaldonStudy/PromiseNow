import CircleBtn from '../../../components/ui/CircleBtn';
import { useCallScreenStore } from '../callScreen.store';

interface Props {
  onClick: () => void;
  onLeaveCall?: () => void;
  onToggleMic?: () => void;
  onToggleVideo?: () => void;
  isConnected?: boolean;
  isMicMuted?: boolean;
  isVideoMuted?: boolean;
}

const CallControlPanel = ({
  onClick,
  onLeaveCall,
  onToggleMic,
  onToggleVideo,
  isConnected,
  isMicMuted = false,
  isVideoMuted = false,
}: Props) => {
  const { toggleViewMode } = useCallScreenStore();

  const handleMicToggle = () => {
    if (onToggleMic) {
      onToggleMic();
    }
  };

  const handleVideoToggle = () => {
    if (onToggleVideo) {
      onToggleVideo();
    }
  };

  return (
    <div className="absolute bottom-7 left-0 w-full px-7 flex justify-between items-end pointer-events-none">
      <div className="flex gap-4 items-end pointer-events-auto">
        <CircleBtn
          iconType={isMicMuted ? 'micOff' : 'mic'}
          color={isMicMuted ? 'white' : 'primary'}
          onClick={handleMicToggle}
          disabled={!isConnected}
        />
        <CircleBtn
          iconType={isVideoMuted ? 'videoOff' : 'video'}
          color={isVideoMuted ? 'white' : 'primary'}
          onClick={handleVideoToggle}
          disabled={!isConnected}
        />
      </div>
      <div className="flex gap-4 items-end pointer-events-auto">
        <CircleBtn iconType="grid" color={'white'} onClick={toggleViewMode} />
        <CircleBtn iconType="chat" color="point" iconSize={39} onClick={onClick} />
        {onLeaveCall && (
          <CircleBtn
            iconType="close"
            color="primary"
            onClick={onLeaveCall}
            disabled={!isConnected}
          />
        )}
      </div>
    </div>
  );
};

export default CallControlPanel;
