import AppointmentInfo from '../../../components/ui/AppointmentInfo';
import Icon from '../../../components/ui/Icon';
import AppointmentEditModal from '../AppointmentEditModal';
import type { AppointmentUpdateRequest } from '../../../apis/room/room.types';

interface ConfirmedAppointmentProps {
  onEdit: () => void;
  isModalOpen: boolean;
  onModalClose: () => void;
  onAppointmentUpdate: (appointmentData: AppointmentUpdateRequest) => void;
  isUpdating: boolean;
}

const ConfirmedAppointment = ({
  onEdit,
  isModalOpen,
  onModalClose,
  onAppointmentUpdate,
  isUpdating,
}: ConfirmedAppointmentProps) => {
  return (
    <div className="pb-5 relative">
      <div className="rounded-md font-medium bg-primary px-5 py-3">
        <AppointmentInfo textColor="text-white" iconColor="text-white" />
      </div>

      <div className="absolute bottom-8 right-4">
        <Icon type="edit" color="text-white" size={20} onClick={onEdit} />
      </div>

      {isModalOpen && (
        <AppointmentEditModal
          isOpen={isModalOpen}
          onClose={onModalClose}
          onConfirm={onAppointmentUpdate}
          isLoading={isUpdating}
        />
      )}
    </div>
  );
};

export default ConfirmedAppointment;
