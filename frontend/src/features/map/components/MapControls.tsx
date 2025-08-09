import CircleBtn from '../../../components/ui/CircleBtn';
import useMapStore from '../map.store';

const MapControls = () => {
  const { rankingHeight, moveToCurrentLocation } = useMapStore();

  const handleMyLocationClick = () => {
    if (moveToCurrentLocation) {
      moveToCurrentLocation();
    }
  };

  return (
    <div
      className="absolute left-0 right-0 flex justify-between px-6 z-50"
      style={{ bottom: `${rankingHeight + 20}px` }}
    >
      <CircleBtn iconType={'camera'} color={'white'} />
      <CircleBtn iconType={'myLocation'} color={'white'} onClick={handleMyLocationClick} />
    </div>
  );
};

export default MapControls;
