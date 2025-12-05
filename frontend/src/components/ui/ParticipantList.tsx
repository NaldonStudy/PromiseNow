import type { SimpleInfoResponse } from '../../apis/room/roomuser.types';
import ProfileName from './ProfileName';

interface Props {
  users: SimpleInfoResponse[] | undefined;
}

const ParticipantList = ({ users }: Props) => {
  return (
    <div className="flex flex-col gap-2">
      {users?.map((user, idx) => (
        <ProfileName key={idx} name={user.nickname} profileImg={user.profileImage} />
      ))}
    </div>
  );
};

export default ParticipantList;
