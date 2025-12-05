import { useState } from 'react';
import type { AppointmentUpdateRequest, DateRangeResponse } from '../../apis/room/room.types';

import AppointmentInfo from '../../components/ui/AppointmentInfo';
import Icon from '../../components/ui/Icon';
import AppointmentEditModal from './AppointmentEditModal';

interface ConfirmedAppointmentProps {
  dateRangeData?: DateRangeResponse;
  appointmentData?: AppointmentUpdateRequest;
  onAppointmentUpdate: (appointmentData: AppointmentUpdateRequest) => void;
}

const ConfirmedAppointment = ({
  appointmentData,
  dateRangeData,
  onAppointmentUpdate,
}: ConfirmedAppointmentProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const formatDate = () => {
    if (!appointmentData?.locationDate) return '';
    const [year, month, day] = appointmentData.locationDate.split('-');
    return `${Number(year)}년 ${Number(month)}월 ${Number(day)}일`;
  };

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
          calenderText={formatDate() || '확정된 날짜가 없습니다.'}
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
          dateRange={dateRangeData}
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onConfirm={handleAppointmentUpdate}
          initialData={appointmentData}
        />
      )}
    </div>
  );
};

export default ConfirmedAppointment;
