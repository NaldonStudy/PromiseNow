import { useNavigate } from 'react-router-dom';
import type { SimpleInfoResponse } from '../../../apis/room/roomuser.types';

import Icon from '../../ui/Icon';
import ParticipantList from '../../ui/ParticipantList';
import CopyCode from './CopyCode';
import PopIcon from './PopIcon';

interface Props {
  title: string | undefined;
  inviteCode: string | undefined;
  users: SimpleInfoResponse[] | undefined;
}

const RoomHeader = ({ title, inviteCode, users }: Props) => {
  const navigate = useNavigate();

  return (
    <div className="flex justify-between px-5 py-4 shadow-md bg-white h-15">
      <div className="flex items-center flex-1 min-w-0">
        <div className="text-primary flex-shrink-0">
          <Icon type="left" onClick={() => navigate('/home')} size={18} />
        </div>
        <span className="font-bold text-lg truncate ml-3 mr-2">{title}</span>
        <div className="flex-shrink-0">
          <CopyCode inviteCode={inviteCode} />
        </div>
      </div>

      <div className="flex gap-5 items-center ml-5 text-text-dark text-sm">
        <PopIcon iconType="bell">
          <span>알림이 없습니다</span>
        </PopIcon>

        <PopIcon iconType="person">
          <ParticipantList users={users} />
        </PopIcon>
      </div>
    </div>
  );
};

export default RoomHeader;
