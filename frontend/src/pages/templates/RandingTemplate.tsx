import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../../stores/user.store';

import landingImg from '../../assets/images/landing.jpg';
import PwaInstallButton from '../../components/PwaInstallButton';
import Kakao from '../../features/login/components/Kakao';
import ManagerBtn from './../../features/login/components/ManagerBtn';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const RandingTemplate = () => {
  const navigate = useNavigate();
  const { setUser } = useUserStore();

  const handleKakaoLogin = () => {
    window.location.href = `${API_BASE}/oauth2/authorization/kakao`;
  };

  const handleKakaoLogin_1 = () => {
    setUser(1);
    navigate('/home');
  };

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
      <Kakao onLogin={handleKakaoLogin} />
      <ManagerBtn onLogin1={handleKakaoLogin_1} onLogin2={handleKakaoLogin_2} />
      <PwaInstallButton />
    </div>
  );
};

export default RandingTemplate;
