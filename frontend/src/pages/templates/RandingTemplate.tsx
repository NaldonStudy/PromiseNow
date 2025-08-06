import { useNavigate } from 'react-router-dom';
import Icon from '../../components/ui/Icon';
import { useUserStore } from '../../stores/user.store';

const RandingTemplate = () => {
  const navigate = useNavigate();
  const { setUser } = useUserStore();

  // 임시 로그인
  const handleKakaoLogin = () => {
    setUser(1);
    navigate('/home');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-5">
      <span className="text-2xl font-bold text-primary py-5">PromissNow</span>
      <span className="text-sm text-secondary text-center leading-relaxed">
        약속부터 만남까지 한 화면에서 {<br />} 함께하는 즐거움
      </span>
      <span className="text-sm text-primary">지금 PromissNow를 시작해보세요!</span>
      <button
        className="flex flex-row bg-yellow-300 font-semibold px-5 py-2 text-sm hover:bg-yellow-400 focus:outline-none"
        onClick={handleKakaoLogin}
      >
        <Icon type="kakaotalk" size={18} color="black" />
        <span className="px-10">카카오로 시작하기</span>
      </button>
    </div>
  );
};

export default RandingTemplate;
