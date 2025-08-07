import { useState } from 'react';

import Input from '../../../components/ui/Input';
import SquareBtn from '../../../components/ui/SquareBtn';
import RoomFindModals from './RoomFindModals';

interface Props {
  onJoinRoom: (inviteCode: string, nickname: string, onSuccess: (roomId: number) => void) => void;
}

const RoomFind = ({ onJoinRoom }: Props) => {
  const [value, setValue] = useState('');
  const [triggerKey, setTriggerKey] = useState(0);

  const handleClick = () => {
    setTriggerKey(Date.now());
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-2">
        <Input
          value={value}
          placeholder="참여 코드를 입력하세요"
          onChange={(e) => setValue(e.target.value)}
        />
        <SquareBtn text="참여" template="filled" width="w-20" onClick={handleClick} />
      </div>
      <RoomFindModals code={value} triggerKey={triggerKey} onJoinRoom={onJoinRoom} />
    </div>
  );
};

export default RoomFind;
