import { dummyParticipants } from '../layout/roomHeader/dummy';
import ProfileName from './ProfileName';

const ParticipantList = () => {
  return (
    <div className="flex flex-col gap-2">
      {dummyParticipants.map((p, idx) => (
        <ProfileName key={idx} name={p.name} profileImg={p.profileImg} />
      ))}
    </div>
  );
};

export default ParticipantList;
