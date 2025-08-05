import { useNavigate } from 'react-router-dom';
import Icon from '../../ui/Icon';
import ParticipantList from '../../ui/ParticipantList';
import CopyCode from './CopyCode';
import PopIcon from './PopIcon';

// roomname + 참여코드 받아올 예정
const RoomHeader = () => {
  const navigate = useNavigate();

  return (
    <div className="flex justify-between px-5 py-4 shadow-md bg-white">
      <div className="flex items-center flex-1 min-w-0">
        <div className="text-primary flex-shrink-0">
          <Icon type="left" onClick={() => navigate('/home')} size={18} />
        </div>
        <span className="font-bold text-lg truncate ml-3 mr-2">Room Name</span>
        <div className="flex-shrink-0">
          <CopyCode />
        </div>
      </div>

      <div className="flex gap-5 items-center ml-5 text-text-dark text-sm">
        <PopIcon iconType="bell">
          <ParticipantList />
        </PopIcon>

        <PopIcon iconType="person">
          <ParticipantList />
        </PopIcon>
      </div>
    </div>
  );
};

export default RoomHeader;
