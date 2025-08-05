import BrandHeader from '../../features/rooms/components/BrandHeader';
import RoomFind from '../../features/rooms/components/RoomFind';
import RoomList from '../../features/rooms/components/RoomList';
import RoomMake from '../../features/rooms/components/RoomMake';
import type { RoomResponse } from '../../features/rooms/dummy';

interface Props {
  rooms: RoomResponse[];
}

const HomeTemplate = ({ rooms }: Props) => {
  return (
    <div className="relative w-full h-full mx-auto bg-white overflow-y-auto">
      <BrandHeader />
      <div className="flex flex-col gap-3 px-8 pt-10">
        <RoomFind />
        <RoomList rooms={rooms} />
        <RoomMake />
      </div>
    </div>
  );
};

export default HomeTemplate;
