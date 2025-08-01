import RoomLayout from '../../components/layout/RoomLayout';
import ArrivalRanking from '../../features/arrivalRanking/components/ArrivalRanking';
import MapView from '../../features/map/components/MapView';

const LocationTemplate = () => {
  return (
    <RoomLayout>
      <div className="h-full relative overflow-hidden">
        <MapView />
        <div className="absolute bottom-0 w-full">
          <ArrivalRanking />
        </div>
      </div>
    </RoomLayout>
  );
};

export default LocationTemplate;
