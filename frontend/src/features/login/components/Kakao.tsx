import Icon from "../../../components/ui/Icon";
import { trackButtonClick, trackLogin } from "../../../lib/gtm";

interface Props {
  onLogin: () => void;
}
const Kakao = ({onLogin}: Props) => {
  
  const handleLoginClick = () => {
    // GTM 이벤트 추적
    trackButtonClick('kakao_login_button');
    trackLogin('kakao');
    
    // 기존 로그인 로직 실행
    onLogin();
  };
  
  return (
    <div>
      <button
        className="flex flex-row bg-yellow-300 font-semibold px-5 py-2 text-sm hover:bg-yellow-400 focus:outline-none"
        onClick={handleLoginClick}
      >
        <Icon type="kakaotalk" size={18} color="black" />
        <span className="px-10">카카오로 시작하기</span>
      </button>
    </div>
  );
};

export default Kakao;
