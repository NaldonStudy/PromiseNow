import Icon from './../../../components/ui/Icon';

interface Props {
  distance?: number;
  speed?: number;
}

const ArrivalInfo = ({ distance, speed }: Props) => {
  return (
    <>
      <div className="text-[0.7rem] text-text-dark flex gap-2">
        <div className="flex items-center gap-1">
          <Icon type="flag" size={10} color="text-text-dark" /> {distance?.toFixed(1) || '0.0'} km 이내
        </div>
        <div className="flex items-center gap-1">
          <Icon type="speed" size={10} color="text-text-dark" />
          {speed?.toFixed(1) || '0.0'} km/h
        </div>
      </div>
    </>
  );
};

export default ArrivalInfo;
