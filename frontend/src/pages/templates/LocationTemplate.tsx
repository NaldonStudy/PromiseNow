import RoomLayout from '../../components/layout/RoomLayout';
import ArrivalRanking from '../../features/arrivalRanking/components/ArrivalRanking';
import MapView from '../../features/map/components/MapView';
import MapControls from './../../features/map/components/MapControls';

interface Props {
  roomId: number;
}

const LocationTemplate = ({ roomId }: Props) => {
  return (
    <RoomLayout>
      <div className="h-full relative overflow-hidden">
        <MapView />
        <MapControls roomId={roomId} />
        <div className="absolute bottom-0 w-full">
          <ArrivalRanking />
        </div>
      </div>
    </RoomLayout>
  );
};

export default LocationTemplate;
