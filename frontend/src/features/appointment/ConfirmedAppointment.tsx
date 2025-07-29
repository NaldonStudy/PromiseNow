import AppointmentInfo from '../../components/ui/AppointmentInfo';

const ConfirmedAppointment = () => {
  return (
    <div className="pb-5 ">
      <div className="rounded-md font-medium bg-primary px-5 py-3">
        <AppointmentInfo textColor="text-white" iconColor="text-white" />
      </div>
    </div>
  );
};

export default ConfirmedAppointment;
