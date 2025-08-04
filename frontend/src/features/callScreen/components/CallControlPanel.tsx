import { useState } from 'react';
import CircleBtn from '../../../components/ui/CircleBtn';

interface Props {
  onClick: () => void; // chat 모달 열기용
}

const CallControlPanel = ({ onClick }: Props) => {
  const [micOn, setMicOn] = useState(false);
  const [videoOn, setVideoOn] = useState(false);

  return (
    <div className="absolute bottom-7 left-0 w-full px-7 flex justify-between items-end">
      <div className="flex gap-4 items-end">
        <CircleBtn
          iconType={micOn ? 'mic' : 'micOff'}
          color="primary"
          onClick={() => setMicOn((prev) => !prev)}
        />
        <CircleBtn
          iconType={videoOn ? 'video' : 'videoOff'}
          color="white"
          onClick={() => setVideoOn((prev) => !prev)}
        />
      </div>
      <CircleBtn
        iconType="chat"
        color="point"
        iconSize={39}
        onClick={onClick}
      />
    </div>
  );
};

export default CallControlPanel;
