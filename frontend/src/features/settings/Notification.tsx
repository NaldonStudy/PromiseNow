import ToggleBtn from './ToggleBtn';

const Notification = () => {
  return (
    <div className="flex items-center justify-between px-5 py-5 border-b border-gray-dark">
      <span className="text-lg">알림설정</span>
      <ToggleBtn />
    </div>
  );
};

export default Notification;
