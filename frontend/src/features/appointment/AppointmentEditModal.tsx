import { useState } from 'react';
import SquareBtn from '../../components/ui/SquareBtn';
import DateSelector from './components/DateSelector';
import LocationInput from './components/LocationInput';
import TimeSelector from './components/TimeSelector';
import ConfirmHeader from './components/ConfirmHeader';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const AppointmentEditModal = ({ isOpen, onClose, onConfirm }: Props) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [locationSearch, setLocationSearch] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-center">
      <div className=" w-full max-w-mobile bg-white px-10 py-5">
        <ConfirmHeader onClose={onClose} />

        <div className="flex flex-col gap-3 my-4">
          <DateSelector value={selectedDate} onChange={setSelectedDate} />
          <TimeSelector value={selectedTime} onChange={setSelectedTime} />
          <LocationInput value={locationSearch} onChange={setLocationSearch} />
        </div>

        <SquareBtn text="저장하기" template="filled" width="w-full" onClick={onConfirm} />
      </div>
    </div>
  );
};

export default AppointmentEditModal;
