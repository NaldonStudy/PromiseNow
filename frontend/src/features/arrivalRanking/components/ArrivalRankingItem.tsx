import Profile from '../../../components/ui/Profile';
import Icon from './../../../components/ui/Icon';
import ArrivalInfo from './ArrivalInfo';
import ArrivalProgressBar from './ArrivalProgressBar';

interface Props {
  rank: number;
  imgUrl?: string;
  name: string;
  progress: number;
  distance: number;
  speed: number;
  online?: boolean;
}

const ArrivalRankingItem = ({ rank, imgUrl, name, progress, distance, speed, online }: Props) => {
  const status =
    speed < 7
      ? 'walking'
      : speed < 16
      ? 'running'
      : speed < 25
      ? 'cycling'
      : speed < 100
      ? 'driving'
      : 'flying';

  return (
    <div className="rounded-lg px-5 py-3 bg-gray">
      <div className="flex justify-between items-center px-2">
        <div className="flex items-center gap-3">
          <div className="text-secondary font-bold text-xl mr-2">{rank}</div>
          <Profile width="w-10" imgUrl={imgUrl} />
          <div>
            <span className="text-sm">{name}</span>
            <ArrivalInfo distance={distance} speed={speed} />
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* 온라인 상태 표시 */}
          {online && <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>}
          {!online && <div className="w-3 h-3 bg-gray-400 rounded-full"></div>}
          <div>
            {status === 'walking' && <Icon type="walking" color="text-secondary" size={30} />}
            {status === 'running' && <Icon type="running" color="text-secondary" size={30} />}
            {status === 'cycling' && <Icon type="cycling" color="text-secondary" size={30} />}
            {status === 'driving' && <Icon type="driving" color="text-secondary" size={30} />}
            {status === 'flying' && <Icon type="flying" color="text-secondary" size={30} />}
          </div>
        </div>
      </div>
      <ArrivalProgressBar progress={progress} />
    </div>
  );
};

export default ArrivalRankingItem;
