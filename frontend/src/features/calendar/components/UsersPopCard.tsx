import { useMemo } from 'react';
import Profile from '../../../components/ui/Profile';

export interface ConfirmedUserData {
  nickname: string;
  profileImage: string;
}

interface Props {
  users: ConfirmedUserData[];
  onClose: () => void;
  anchor: { x: number; y: number };
}

const UsersPopCard = ({ users, onClose, anchor }: Props) => {
  const positionClass = useMemo(() => {
    if (anchor.x - 120 < 0) {
      return 'translate-x-0';
    }
    return '-translate-x-full';
  }, [anchor.x]);

  return (
    <div
      className={`fixed z-[1000] bg-white rounded-lg shadow-lg pl-4 pr-5 py-3 max-w-[120px] transform ${positionClass}`}
      style={{
        top: anchor.y,
        left: anchor.x,
      }}
      onClick={onClose}
    >
      <div className="flex flex-col gap-2">
        {users.map((user, idx) => (
          <div key={idx} className="flex items-center w-full min-w-0">
            <div className="shrink-0">
              <Profile imgUrl={user.profileImage} width="w-5" iconSize={12} />
            </div>
            <span className="pl-2 truncate block max-w-[80px]">{user.nickname}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UsersPopCard;
