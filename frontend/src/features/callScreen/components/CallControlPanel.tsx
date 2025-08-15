/* eslint-disable @typescript-eslint/no-explicit-any */
import CircleBtn from '../../../components/ui/CircleBtn';
import { useCallScreenStore } from '../callScreen.store';

interface Props {
  onClick: () => void;
  onToggleMic?: () => void;
  onToggleVideo?: () => void;
  onEnableMic?: () => void;
  onEnableVideo?: () => void;

  isConnected?: boolean;
  isMicMuted?: boolean;
  isVideoMuted?: boolean;
  micProducer?: any;
  webcamProducer?: any;
}

const CallControlPanel = ({
  onClick,
  onToggleMic,
  onToggleVideo,
  onEnableMic,
  onEnableVideo,
  isConnected,
  isMicMuted,
  isVideoMuted,
  micProducer,
  webcamProducer,
}: Props) => {
  const { toggleViewMode } = useCallScreenStore();

  const handleMicClick = () => {
    if (!isConnected) return;

    if (!micProducer && onEnableMic) {
      onEnableMic();
      return;
    }
    if (onToggleMic) onToggleMic();
  };

  const handleVideoClick = () => {
    if (!isConnected) return;

    if (!webcamProducer && onEnableVideo) {
      onEnableVideo();
      return;
    }
    if (onToggleVideo) onToggleVideo();
  };

  const micMuted = !!isMicMuted;
  const videoMuted = !!isVideoMuted;

  return (
    <div className="absolute bottom-7 left-0 w-full px-7 flex justify-between items-end pointer-events-none">
      <div className="flex gap-4 items-end pointer-events-auto">
        <CircleBtn
          iconType={micMuted ? 'micOff' : 'mic'}
          color={micMuted ? 'white' : 'primary'}
          onClick={handleMicClick}
          disabled={!isConnected}
        />
        <CircleBtn
          iconType={videoMuted ? 'videoOff' : 'video'}
          color={videoMuted ? 'white' : 'primary'}
          onClick={handleVideoClick}
          disabled={!isConnected}
        />
      </div>
      <div className="flex gap-4 items-end pointer-events-auto">
        <CircleBtn iconType="grid" color={'white'} onClick={toggleViewMode} />
        <CircleBtn iconType="chat" color="point" iconSize={39} onClick={onClick} />
      </div>
    </div>
  );
};

export default CallControlPanel;
