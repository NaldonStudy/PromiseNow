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
    <div className="flex justify-center bg-gray-100 h-dvh">
      <div className="w-full max-w-mobile h-dvh flex flex-col bg-white overflow-hidden">
        <header className="sticky top-0 z-20 h-14 shrink-0 bg-white pt-[env(safe-area-inset-top)]">
          <RoomHeader title={roomInfo?.roomTitle} inviteCode={roomInfo?.inviteCode} users={users} />
        </header>

        <main className="flex-1 overflow-y-auto hide-scrollbar">{children}</main>

        <footer className="sticky bottom-0 z-20 h-[70px] shrink-0 bg-white pb-[env(safe-area-inset-bottom)]">
          <RoomNav />
        </footer>
      </div>
    </div>
  );
};

export default RoomLayout;
