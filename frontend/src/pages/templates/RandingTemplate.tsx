import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../../stores/user.store';

import landingImg from '../../assets/images/landing.jpg';
import PwaInstallButton from '../../components/PwaInstallButton';
import Icon from '../../components/ui/Icon';

const RandingTemplate = () => {
  const navigate = useNavigate();
  const { setUser } = useUserStore();

  // 임시 로그인
  const handleKakaoLogin = () => {
    setUser(1);
    navigate('/home');
  };

  // 관리자용 ( 추후 삭제 예정 )
  // 유저 1
  const handleKakaoLogin_1 = () => {
    setUser(1);
    navigate('/home');
  };

  // 유저 2
  const handleKakaoLogin_2 = () => {
    setUser(2);
    navigate('/home');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-5">
      <span className="text-2xl font-bold text-primary py-5">PromissNow</span>
      <span className="text-sm text-secondary text-center leading-relaxed">
        약속부터 만남까지 한 화면에서 {<br />} 함께하는 즐거움
      </span>
      <span className="text-sm text-primary">지금 PromissNow를 시작해보세요!</span>

      <img src={landingImg} alt="landing img" className="max-w-full w-64 h-auto" />

      {/* 로그인 버튼 */}
      <button
        className="flex flex-row bg-yellow-300 font-semibold px-5 py-2 text-sm hover:bg-yellow-400 focus:outline-none"
        onClick={handleKakaoLogin}
      >
        <Icon type="kakaotalk" size={18} color="black" />
        <span className="px-10">카카오로 시작하기</span>
      </button>

      {/* 관리자용 버튼 ( 추후 삭제 예정 ) */}
      <div className="flex flex-row gap-10">
        <button className="bg-blue-300 w-20 h-10" onClick={handleKakaoLogin_1}>
          유저 1
        </button>
        <button className="bg-green-300 w-20 h-10" onClick={handleKakaoLogin_2}>
          유저 2
        </button>
      </div>
      <PwaInstallButton />
    </div>
  );
};

export default RandingTemplate;
