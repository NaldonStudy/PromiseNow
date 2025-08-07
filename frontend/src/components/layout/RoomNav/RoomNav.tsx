import { useParams } from 'react-router-dom';

import NavItem from './NavItem';
import RoomNavCall from './RoomNavCall';

const RoomNav = () => {
  const { id } = useParams();

  return (
    <div className="relative">
      <div
        className="relative bg-white py-2 px-3 flex justify-around items-center"
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
        <NavItem type="roulette" text="룰렛" link={`/${id}/roulette`} />
        <NavItem type="calendar" text="일정" link={`/${id}/schedule`} />
        <div className="w-15" />
        <NavItem type="location" text="위치" link={`/${id}/location`} />
        <NavItem type="settings" text="설정" link={`/${id}/settings`} />
      </div>
    </div>
  );
};

export default RoomNav;
