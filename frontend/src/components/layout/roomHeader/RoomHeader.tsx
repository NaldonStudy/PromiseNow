import { useNavigate } from 'react-router-dom';
import Icon from '../../ui/Icon';
import CopyCode from './CopyCode';
import ParticipantList from './ParticipantList';
import PopIcon from './PopIcon';

// roomname + 참여코드 받아올 예정
const RoomHeader = () => {
  const navigate = useNavigate();

  return (
    <div className="flex justify-between px-6 py-4 shadow-md bg-white">
      <div className="flex gap-3 items-center">
        <div className="text-primary">
          <Icon type="left" onClick={() => navigate('/home')} />
        </div>
        <span className="font-bold text-lg">Room Name</span>
        <CopyCode />
      </div>

      <div className="flex gap-6 items-center text-text-dark text-sm">
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
