import BrandHeader from '../features/rooms/components/BrandHeader';
import { dummy } from '../features/rooms/dummy';
import RoomFind from './../features/rooms/components/RoomFind';
import RoomList from './../features/rooms/components/RoomList';
import RoomMake from './../features/rooms/components/RoomMake';
const HomePage = () => {
  return (
    <>
      <BrandHeader />

      <RoomFind />

      <RoomList rooms={dummy} />

      <RoomMake />
    </>
  );
};

export default HomePage;
