import { useState } from 'react';
import SquareBtn from '../../components/ui/SquareBtn';
import DateSelector from './components/DateSelector';
import LocationInput from './components/LocationInput';
import TimeSelector from './components/TimeSelector';
import ConfirmHeader from './components/ConfirmHeader';
import type { AppointmentUpdateRequest } from '../../apis/room/room.types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (appointmentData: AppointmentUpdateRequest) => void;
}

const AppointmentEditModal = ({ isOpen, onClose, onConfirm }: Props) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [locationSearch, setLocationSearch] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<{
    name: string;
    lat: number;
    lng: number;
  } | null>(null);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!selectedDate || !selectedTime || !selectedLocation) {
      alert('모든 필드를 입력해주세요.');
      return;
    }

    const appointmentData: AppointmentUpdateRequest = {
      locationDate: selectedDate,
      locationTime: selectedTime,
      locationName: selectedLocation.name,
      locationLat: selectedLocation.lat,
      locationLng: selectedLocation.lng,
    };
    onConfirm(appointmentData);
  };

  const handleLocationSelect = (location: { name: string; lat: number; lng: number }) => {
    setSelectedLocation(location);
    setLocationSearch(location.name);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-center">
      <div className=" w-full max-w-mobile bg-white px-10 py-5">
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
