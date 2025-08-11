import { FaRegClock, FaRunning } from 'react-icons/fa';

interface Props {
  eta?: string;
  speed?: number;
}

const ArrivalInfo = ({ eta, speed }: Props) => {
  return (
    <>
      <div className="text-[0.7rem] text-text-dark flex gap-2">
        <div className="flex items-center gap-1">
          <FaRegClock size={10} /> {eta}
        </div>
        <div className="flex items-center gap-1">
          <FaRunning size={10} /> {speed} km/h
        </div>
      </div>
    </>
  );
};

export default ArrivalInfo;
