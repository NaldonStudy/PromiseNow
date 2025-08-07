import { useEffect, useState } from 'react';
import type { AppointmentUpdateRequest } from '../../apis/room/room.types';
import SquareBtn from '../../components/ui/SquareBtn';
import ConfirmHeader from './components/ConfirmHeader';
import DateSelector from './components/DateSelector';
import LocationInput from './components/LocationInput';
import TimeSelector from './components/TimeSelector';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (appointmentData: AppointmentUpdateRequest) => void;
  initialData?: AppointmentUpdateRequest;
}

const AppointmentEditModal = ({ isOpen, onClose, onConfirm, initialData }: Props) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [locationSearch, setLocationSearch] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<{
    name: string;
    lat: number;
    lng: number;
  } | null>(null);

  useEffect(() => {
    if (initialData) {
      setSelectedDate(initialData.locationDate || '');
      setSelectedTime(initialData.locationTime || '');
      if (initialData.locationName) {
        setLocationSearch(initialData.locationName);
        setSelectedLocation({
          name: initialData.locationName,
          lat: initialData.locationLat ?? 0,
          lng: initialData.locationLng ?? 0,
        });
      } else {
        setLocationSearch('');
        setSelectedLocation(null);
      }
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    const appointmentData: AppointmentUpdateRequest = {};

    if (selectedDate) appointmentData.locationDate = selectedDate;
    if (selectedTime) appointmentData.locationTime = selectedTime;
    if (selectedLocation) {
      appointmentData.locationName = selectedLocation.name;
      appointmentData.locationLat = selectedLocation.lat;
      appointmentData.locationLng = selectedLocation.lng;
    }

    onConfirm(appointmentData);
  };

  const handleLocationSelect = (location: { name: string; lat: number; lng: number }) => {
    setSelectedLocation(location);
    setLocationSearch(location.name);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-center">
      <div className="w-full max-w-mobile bg-white px-10 py-5">
        <ConfirmHeader onClose={onClose} />

        <div className="flex flex-col gap-3 my-4">
          <DateSelector value={selectedDate} onChange={setSelectedDate} />
          <TimeSelector value={selectedTime} onChange={setSelectedTime} />
          <LocationInput
            value={locationSearch}
            onChange={setLocationSearch}
            onLocationSelect={handleLocationSelect}
          />
        </div>

        <SquareBtn text={'저장하기'} template="filled" width="w-full" onClick={handleConfirm} />
      </div>
    </div>
  );
};

export default AppointmentEditModal;
