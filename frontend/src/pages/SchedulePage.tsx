import { useParams } from 'react-router-dom';
import { useTotalAvailability } from '../hooks/queries/availability';
import ScheduleTemplate from './templates/ScheduleTemplate';

const SchedulePage = () => {
  const { id } = useParams<{ id: string }>();
  const roomId = Number(id);

  const { data: totalAvailabilityData } = useTotalAvailability(roomId);

  return <ScheduleTemplate totalAvailabilityData={totalAvailabilityData} />;
};

export default SchedulePage;
