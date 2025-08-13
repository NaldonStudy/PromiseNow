import { useTitle } from '../hooks/common/useTitle';

import RequireAuth from '../components/RequireAuth';
import LocationTemplate from './templates/LocationTemplate';

const LocationPage = () => {
  useTitle('위치 - PromiseNow');

  return (
    <RequireAuth>
      <LocationTemplate />
    </RequireAuth>
  );
};

export default LocationPage;
