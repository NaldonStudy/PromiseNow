import CircleBtn from '../../../components/ui/CircleBtn';
import { useMeStore } from '../../../hooks/webrtc/stores/me';
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
}: Props) => {
  const { toggleViewMode } = useCallScreenStore();
  const { audioMuted, videoMuted } = useMeStore();

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
          iconType={audioMuted ? 'micOff' : 'mic'}
          color={audioMuted ? 'white' : 'primary'}
          onClick={handleMicToggle}
          disabled={!isConnected}
        />
        <CircleBtn
          iconType={videoMuted ? 'videoOff' : 'video'}
          color={videoMuted ? 'white' : 'primary'}
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
