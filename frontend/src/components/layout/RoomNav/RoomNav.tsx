import { useParams } from 'react-router-dom';
import { FiTarget, FiCalendar, FiMapPin, FiSettings } from 'react-icons/fi';

import RoomNavItem from './RoomNavItem';
import RoomNavCall from './RoomNavCall';

const RoomNav = () => {
  const { id } = useParams();

  return (
    <div className="relative">
      <div
        className="relative bg-white py-4 px-10 flex justify-between items-center"
        style={{
          filter: 'drop-shadow(0 -1px 3px rgba(0, 0, 0, 0.1))',
        }}
      >
        {/* 통화 버튼 */}
        <div className="absolute top-[-15px] left-1/2 transform -translate-x-1/2">
          <div className="bg-white rounded-full px-3.5 py-3">
            <RoomNavCall link={`/${id}/call`} />
          </div>
        </div>

        <RoomNavItem label="룰렛" icon={FiTarget} link={`/${id}/roulette`} />
        <RoomNavItem label="일정" icon={FiCalendar} link={`/${id}/schedule`} />
        <div className="w-10" />
        <RoomNavItem label="위치" icon={FiMapPin} link={`/${id}/location`} />
        <RoomNavItem label="설정" icon={FiSettings} link={`/${id}/settings`} />
      </div>
    </div>
  );
};

export default RoomNav;
