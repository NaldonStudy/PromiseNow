import { type ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import { useRoomTitleCode, useUsersInRoom } from '../../hooks/queries/room';

import RoomHeader from './roomHeader/RoomHeader';
import RoomNav from './RoomNav/RoomNav';

interface Props {
  children: ReactNode;
}

const RoomLayout = ({ children }: Props) => {
  const { id } = useParams<{ id: string }>();
  const parsedRoomId = Number(id);
  
  const { data: roomInfo } = useRoomTitleCode(parsedRoomId);
  const { data: users } = useUsersInRoom(parsedRoomId);

  return (
    <div className="flex justify-center bg-gray-100 min-h-screen">
      <div className="w-full max-w-mobile h-screen flex flex-col overflow-hidden bg-white relative">
        <header className="fixed top-0 left-1/2 -translate-x-1/2 z-20 w-full max-w-mobile">
          <RoomHeader title={roomInfo?.roomTitle} inviteCode={roomInfo?.inviteCode} users={users} />
        </header>

        <main className="relative flex-1 overflow-y-auto mt-[60px] mb-[70px] hide-scrollbar">
          {children}
        </main>

        <footer className="fixed bottom-0 left-1/2 -translate-x-1/2 z-20 w-full max-w-mobile">
          <RoomNav />
        </footer>
      </div>
    </div>
  );
};

export default RoomLayout;
