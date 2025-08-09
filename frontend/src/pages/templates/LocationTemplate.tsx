import RoomLayout from '../../components/layout/RoomLayout';
import ArrivalRanking from '../../features/arrivalRanking/components/ArrivalRanking';
import MapControls from '../../features/map/components/MapControls';
import MapView from '../../features/map/components/MapView';

const LocationTemplate = () => {
  return (
    <RoomLayout>
      <div className="h-full relative overflow-hidden">
        <MapView />
        <MapControls />
        <div className="absolute bottom-0 w-full">
          <ArrivalRanking />
        </div>
      </div>
    </RoomLayout>
  );
};

export default LocationTemplate;
