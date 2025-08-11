import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Icon from '../../components/ui/Icon';
import { useUserStore } from '../../stores/user.store';

const LandingTemplate = () => {
  const navigate = useNavigate();
  const { setUser } = useUserStore();
  const [inputUserId, setInputUserId] = useState('1');
  const [hardcodedUserId, setHardcodedUserId] = useState(1);

  // 현재 하드코딩된 ID 콘솔 출력
  console.log('🔍 현재 하드코딩된 userId:', hardcodedUserId);

  // 전역 설정 버튼
  const handleSetGlobalUserId = () => {
    const userId = parseInt(inputUserId) || 1;
    setHardcodedUserId(userId);
    console.log('🌍 전역 userId 설정 완료:', userId);
    alert(`전역 userId가 ${userId}로 설정되었습니다!`);
  };

  const handleKakaoLogin = () => {
    console.log('🚀 설정할 userId:', hardcodedUserId);
    setUser(hardcodedUserId);
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

      {/* userId 입력 및 설정 */}
      <div className="flex flex-col items-center gap-3 mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
        <label className="text-sm font-medium text-gray-700">테스트용 userId 설정:</label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={inputUserId}
            onChange={(e) => setInputUserId(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1 text-sm w-20 text-center"
            placeholder="1"
            min="1"
          />
          <button
            onClick={handleSetGlobalUserId}
            className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
          >
            설정
          </button>
        </div>
        <div className="text-xs text-gray-600">
          <div>
            현재 전역 설정: <span className="font-bold text-blue-600">{hardcodedUserId}</span>
          </div>
          <div>
            입력값: <span className="font-bold">{inputUserId}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingTemplate;
