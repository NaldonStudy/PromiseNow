import BrandHeader from '../features/rooms/components/BrandHeader';
import RoomMakeWithModals from '../features/rooms/components/RoomMakeWithModals';
import { dummy } from '../features/rooms/dummy';
import RoomFind from './../features/rooms/components/RoomFind';
import RoomList from './../features/rooms/components/RoomList';
const HomePage = () => {
  return (
    <>
      <BrandHeader />

      <RoomFind />

      <RoomList rooms={dummy} />

      <RoomMakeWithModals />
    </>
  );
};

export default HomePage;
