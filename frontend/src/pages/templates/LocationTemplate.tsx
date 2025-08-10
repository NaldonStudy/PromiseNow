import RoomLayout from '../../components/layout/RoomLayout';
import ArrivalRanking from '../../features/arrivalRanking/components/ArrivalRanking';
import MapControls from '../../features/map/components/MapControls';
import MapView from '../../features/map/components/MapView';

type TargetPin = { lat: number; lng: number };

interface Props {
  appointmentTarget?: TargetPin;
}

const LocationTemplate = ({ appointmentTarget }: Props) => {
  return (
    <RoomLayout>
      <div className="h-full relative overflow-hidden">
        <MapView target={appointmentTarget} />
        <MapControls />
        <div className="absolute bottom-0 w-full">
          <ArrivalRanking />
        </div>
      </div>
    </RoomLayout>
  );
};

export default LocationTemplate;
