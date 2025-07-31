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
    <>
      <BrandHeader />
      <RoomFind />
      <RoomList rooms={rooms} />
      <RoomMake />
    </>
  );
};

export default HomeTemplate;
