import { config } from '../../config/environment';

import Kakao from '../../features/login/components/Kakao';
import PwaInstallButton from '../../components/PwaInstallButton';


const LandingTemplate = () => {
  // 실제 OAuth2 로그인
  const handleKakaoLogin = () => {
    window.location.href = config.oauthRedirectUrl;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-5">
      <span className="text-2xl font-bold text-primary py-5">PromissNow</span>
      <span className="text-sm text-secondary text-center leading-relaxed">
        약속부터 만남까지 한 화면에서 {<br />} 함께하는 즐거움
      </span>
      <span className="text-sm text-primary">지금 PromissNow를 시작해보세요!</span>
      <Kakao onLogin={handleKakaoLogin} />
      <PwaInstallButton />
    </div>
  );
};

export default LandingTemplate;
