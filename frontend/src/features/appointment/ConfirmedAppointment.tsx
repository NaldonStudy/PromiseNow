import { useState } from 'react';
import AppointmentInfo from '../../components/ui/AppointmentInfo';
import Icon from './../../components/ui/Icon';
import AppointmentEditModal from './AppointmentEditModal';

const ConfirmedAppointment = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="pb-5 relative">
      <div className="rounded-md font-medium bg-primary px-5 py-3">
        <AppointmentInfo textColor="text-white" iconColor="text-white" />
      </div>

      <div className="absolute bottom-8 right-4">
        <Icon
          type="edit"
          color="text-white"
          size={20}
          onClick={() => setIsModalOpen(true)}
        />
      </div>

      {isModalOpen && (
        <AppointmentEditModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={() => {
            // 저장 버튼 눌렀을 때 처리
            setIsModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default ConfirmedAppointment;
