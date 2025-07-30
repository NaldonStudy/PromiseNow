import RoomLayout from '../components/layout/RoomLayout';
import ArrivalRanking from '../features/arrivalRanking/components/ArrivalRanking';

const LocationPage = () => {
  return (
    <RoomLayout>
      <div className="bg-gray-dark h-full relative overflow-hidden">
        <div className="absolute bottom-0 w-full">
          <ArrivalRanking />
        </div>
      </div>
    </RoomLayout>
  );
};

export default LocationPage;
