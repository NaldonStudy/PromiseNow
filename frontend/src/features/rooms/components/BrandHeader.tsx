import { useNavigate } from 'react-router-dom';
import SquareBtn from './../../../components/ui/SquareBtn';
// 상태관리 초기화 필요 (뭐뭐 해야하는지 몰라서 일단 둠)

const BrandHeader = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();

    navigate('/');
  };

  return (
    <div className="flex items-center justify-between text-white font-bold px-7 py-4 bg-primary">
      PromiseNow
      <SquareBtn
        text="로그아웃"
        template="filled"
        width="15"
        className="font-bold"
        onClick={handleLogout}
      />
    </div>
  );
};

export default BrandHeader;
