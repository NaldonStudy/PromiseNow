import { FaLocationArrow } from 'react-icons/fa';
import useMapStore from '../map.store';

const MapControls = () => {
  const { moveToCurrentLocation } = useMapStore();

  return (
    <div className="absolute top-4 right-4 flex flex-col gap-2">
      <button
        onClick={() => moveToCurrentLocation?.()}
        className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
        title="현재 위치로 이동"
      >
        <FaLocationArrow className="text-gray-600" />
      </button>
    </div>
  );
};

export default MapControls;
