import CallControlPanel from './CallControlPanel';
import VideoGrid from './VideoGrid';

import { dummyCallUsers } from '../dummy';

const CallScreen = () => {
  return (
    <div className="relative h-full">
      <VideoGrid participants={dummyCallUsers} />
      <CallControlPanel />
    </div>
  );
};

export default CallScreen;
