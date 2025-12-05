import { logout } from '../../../apis/auth/auth.api';

import SquareBtn from './../../../components/ui/SquareBtn';

const BrandHeader = () => {
  const handleLogout = async () => {
    await logout();
    window.location.reload();
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
