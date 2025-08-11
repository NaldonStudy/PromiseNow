import Profile from '../../../components/ui/Profile';
import ArrivalInfo from './ArrivalInfo';
import ArrivalProgressBar from './ArrivalProgressBar';
import { FaRunning } from 'react-icons/fa';

interface Props {
  rank: number;
  imgUrl?: string;
  name: string;
  progress: number;
  eta: string;
  speed: number;
  online?: boolean;
}

const ArrivalRankingItem = ({ rank, imgUrl, name, progress, eta, speed, online }: Props) => {
  return (
    <div className="rounded-lg px-5 py-3 bg-gray">
      <div className="flex justify-between items-center px-2">
        <div className="flex items-center gap-3">
          <div className="text-secondary font-bold text-xl mr-2">{rank}</div>
          <Profile width="w-10 h-10" imgUrl={imgUrl} />
          <div>
            <span className="text-sm">{name}</span>
            <ArrivalInfo eta={eta} speed={speed} />
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* 온라인 상태 표시 */}
          {online && (
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          )}
          {!online && (
            <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
          )}
          <div className="text-secondary">
            <FaRunning size={30} />
          </div>
        </div>
      </div>
      <ArrivalProgressBar progress={progress} />
    </div>
  );
};

export default ArrivalRankingItem;
