import { useTitle } from '../hooks/common/useTitle';

import LocationTemplate from './templates/LocationTemplate';

const LocationPage = () => {
  useTitle('위치 - PromiseNow');

  return <LocationTemplate />;
};

export default LocationPage;
