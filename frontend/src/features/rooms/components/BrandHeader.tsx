import { useUserStore } from '../../../stores/user.store';
import SquareBtn from './../../../components/ui/SquareBtn';

const BrandHeader = () => {
  const { logout } = useUserStore();

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    logout();
    window.location.replace('/');
  };

  return (
    <div className="flex items-center justify-between text-white font-bold px-7 py-4 bg-primary">
      PromiseNow
      <SquareBtn
        text="로그아웃"
        template="filled"
        width="w-15"
        height="h-auto"
        className="font-bold"
        onClick={handleLogout}
      />
    </div>
  );
};

export default BrandHeader;
