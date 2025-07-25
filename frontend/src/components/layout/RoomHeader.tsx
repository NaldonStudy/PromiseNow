import { MdNavigateBefore } from 'react-icons/md';
import { FaRegBell, FaRegUser } from 'react-icons/fa';

import CopyCode from '../ui/CopyCode';

const RoomHeader = () => {
  return (
    <div className="flex justify-between px-6 py-4 shadow-md bg-white">
      <div className="flex gap-3 items-center">
        <div className="text-primary">
          <MdNavigateBefore />
        </div>
        <span className="font-bold text-lg">Room Name</span>
        <CopyCode />
      </div>
      <div className="flex gap-6 items-center text-text-dark text-sm">
        <FaRegBell />
        <FaRegUser />
      </div>
    </div>
  );
};

export default RoomHeader;
