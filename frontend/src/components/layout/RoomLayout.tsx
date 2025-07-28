import type { ReactNode } from 'react';

import RoomHeader from './RoomHeader';
import RoomNav from './roomNav/RoomNav';

interface Props {
  children: ReactNode;
}

const RoomLayout = ({ children }: Props) => {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <header className="fixed top-0 left-0 right-0 z-20">
        <RoomHeader />
      </header>

      <main className="relative flex-1 overflow-y-auto mt-[60px] mb-[70px]">{children}</main>

      <footer className="fixed bottom-0 left-0 right-0 z-20">
        <RoomNav />
      </footer>
    </div>
  );
};

export default RoomLayout;
