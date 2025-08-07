// import type { RoomResponse } from '../dummy';
import type { RoomListItem } from './../../../apis/room/room.types';
import RoomCard from './RoomCard';

interface Props {
  rooms: RoomListItem[];
}

const RoomList = ({ rooms }: Props): React.ReactElement => {
  return (
    <div className="flex flex-col ">
      {rooms.length === 0 ? (
        <div className="text-center text-gray-500">참가한 방이 없습니다.</div>
      ) : (
        rooms.map((room) => (
          <RoomCard
            key={room.roomId}
            id={room.roomId}
            roomTitle={room.roomTitle}
            participantSummary={room.participantSummary}
            locationDate={room.locationDate}
            locationTime={room.locationTime}
            locationName={room.locationName}
          />
        ))
      )}
    </div>
  );
};

export default RoomList;
