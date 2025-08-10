import { useParams } from 'react-router-dom';
import { useTitle } from '../hooks/common/useTitle';

import { useAppointment } from '../hooks/queries/room';

import RequireAuth from '../components/RequireAuth';
import LocationTemplate from './templates/LocationTemplate';

const LocationPage = () => {
  useTitle('위치 - PromiseNow');
  const { id } = useParams();
  const roomId = Number(id);

  const { data: appointment } = useAppointment(roomId);

  const hasLat =
    typeof appointment?.locationLat === 'number' && Number.isFinite(appointment.locationLat);

  const hasLng =
    typeof appointment?.locationLng === 'number' && Number.isFinite(appointment.locationLng);

  const target =
    hasLat && hasLng ? { lat: appointment!.locationLat, lng: appointment!.locationLng } : undefined;

  return (
    <RequireAuth>
      <LocationTemplate appointmentTarget={target} />
    </RequireAuth>
  );
};

export default LocationPage;
