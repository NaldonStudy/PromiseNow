import CallControlPanel from './CallControlPanel';
import VideoGrid from './VideoGrid';

import { dummyCallUsers } from '../dummy';

import { useNavigate, useParams } from 'react-router-dom';

const CallScreen = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const handleChatClick = () => {
    if (!id) return;
    navigate(`/${id}/chat`);
  };

  return (
    <div className="relative h-full">
      <VideoGrid participants={dummyCallUsers} />
      <CallControlPanel onClick={handleChatClick} />
    </div>
  );
};

export default CallScreen;
