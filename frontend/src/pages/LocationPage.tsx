import { useParams } from 'react-router-dom';

import { useTitle } from '../hooks/common/useTitle';

import RequireAuth from '../components/RequireAuth';
import LocationTemplate from './templates/LocationTemplate';

const LocationPage = () => {
  useTitle('위치 - PromiseNow');
  const { id } = useParams();
  const roomId = Number(id);

  return (
    <RequireAuth>
      <LocationTemplate roomId={roomId} />
    </RequireAuth>
  );
};

export default LocationPage;
