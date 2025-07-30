import type { RoomResponse } from '../dummy';
import RoomCard from './RoomCard';

interface Props {
  rooms: RoomResponse[];
}

const RoomList = ({ rooms }: Props):React.ReactElement => {
  return (
    <div className="flex flex-col ">
      {rooms.map((room) => (
        <RoomCard
          key={room.roomId}
          id={room.roomId}
          roomTitle={room.roomTitle}
          participantSummary={room.participantSummary}
          locationDate={room.locationDate}
          locationTime={room.locationTime}
          locationName={room.locationName}
        />
      ))}
    </div>
  );
};

export default RoomList;
