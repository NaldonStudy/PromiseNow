import { useState } from 'react';
import type { AppointmentUpdateRequest } from '../../apis/room/room.types';

import Icon from '../../components/ui/Icon';
import AppointmentInfo from '../../components/ui/AppointmentInfo';
import AppointmentEditModal from './AppointmentEditModal';

interface ConfirmedAppointmentProps {
  appointmentData?: AppointmentUpdateRequest;
  onAppointmentUpdate: (appointmentData: AppointmentUpdateRequest) => void;
}

const ConfirmedAppointment = ({
  appointmentData,
  onAppointmentUpdate,
}: ConfirmedAppointmentProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleEdit = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleAppointmentUpdate = (appointmentData: AppointmentUpdateRequest) => {
    onAppointmentUpdate(appointmentData);
    setIsModalOpen(false);
  };

  return (
    <div className="pb-5 relative">
      <div className="rounded-md font-medium bg-primary px-5 py-3">
        <AppointmentInfo
          calenderText={appointmentData?.locationDate || '확정된 날짜가 없습니다.'}
          timeText={appointmentData?.locationTime || '확정된 시간이 없습니다.'}
          locationText={appointmentData?.locationName || '확정된 장소가 없습니다.'}
          textColor="text-white"
          iconColor="text-white"
        />
      </div>

      <div className="absolute bottom-8 right-4">
        <Icon type="edit" color="text-white" size={20} onClick={handleEdit} />
      </div>

      {isModalOpen && (
        <AppointmentEditModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onConfirm={handleAppointmentUpdate}
        />
      )}
    </div>
  );
};

export default ConfirmedAppointment;
