import { useState } from 'react';
import CircleBtn from '../../../components/ui/CircleBtn';
import { useCallScreenStore } from '../callScreen.store';

interface Props {
  onClick: () => void;
  onLeaveCall?: () => void;
  isConnected?: boolean;
}

const CallControlPanel = ({ onClick, onLeaveCall, isConnected }: Props) => {
  const [micOn, setMicOn] = useState(false);
  const [videoOn, setVideoOn] = useState(false);
  const { toggleViewMode } = useCallScreenStore();

  return (
    <div className="absolute bottom-7 left-0 w-full px-7 flex justify-between items-end pointer-events-none">
      <div className="flex gap-4 items-end pointer-events-auto">
        <CircleBtn
          iconType={micOn ? 'mic' : 'micOff'}
          color={micOn ? 'primary' : 'white'}
          onClick={() => setMicOn((prev) => !prev)}
        />
        <CircleBtn
          iconType={videoOn ? 'video' : 'videoOff'}
          color={videoOn ? 'primary' : 'white'}
          onClick={() => setVideoOn((prev) => !prev)}
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
