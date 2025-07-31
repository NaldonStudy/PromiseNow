import BrandHeader from '../features/rooms/components/BrandHeader';
import { dummy } from '../features/rooms/dummy';
import RoomFind from './../features/rooms/components/RoomFind';
import RoomList from './../features/rooms/components/RoomList';
import RoomMake from './../features/rooms/components/RoomMake';
const HomePage = () => {
  return (
    <>
      <div className="relative w-[390px] h-[844px] mx-auto bg-white overflow-y-auto">
        <BrandHeader />
        <RoomFind />
        <RoomList rooms={dummy} />
        <RoomMake />
      </div>
    </>
  );
};

export default HomePage;
