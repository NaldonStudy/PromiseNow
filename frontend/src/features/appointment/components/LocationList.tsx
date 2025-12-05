import Icon from '../../../components/ui/Icon';

interface LocationItem {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
}

interface LocationListProps {
  locations: LocationItem[];
  onLocationSelect: (location: LocationItem) => void;
}

const LocationList = ({ locations, onLocationSelect }: LocationListProps) => {
  return (
    <div className="border border-gray-dark rounded-lg overflow-scroll hide-scrollbar max-h-72">
      {locations.map((location, index) => (
        <button
          key={location.id}
          onClick={() => onLocationSelect(location)}
          className={`w-full flex items-center gap-3 px-4 py-4 text-left hover:bg-gray-50 transition-colors ${
            index !== locations.length - 1 ? 'border-b border-gray-dark' : ''
          }`}
        >
          <div className="flex-shrink-0">
            <Icon type="marker" size={20} color="text-primary" />
          </div>
          <div className="flex-1">
            <div className="text-sm text-text-dark">{location.name}</div>
            <div className="text-xs text-text-light">{location.address}</div>
          </div>
        </button>
      ))}
    </div>
  );
};

export default LocationList;
