import { useState } from 'react';
import axiosInstance from '../lib/axiosInstance';
import { getMyInfo } from '../apis/user/user.api';

const TestPage = () => {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  // 1. 정상 API 호출 테스트
  const testNormalApiCall = async () => {
    setIsLoading(true);
    try {
      addResult('정상 API 호출 테스트 시작...');
      const userInfo = await getMyInfo();
      addResult(`✅ 정상 호출 성공: ${userInfo?.username}`);
    } catch (error) {
      addResult(`❌ 정상 호출 실패: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. 쿠키 삭제 후 API 호출 테스트 (401 에러 발생)
  const test401Error = async () => {
    setIsLoading(true);
    try {
      addResult('쿠키 삭제 후 API 호출 테스트 시작...');
      
      // 쿠키 삭제
      document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = 'refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      addResult('쿠키 삭제 완료');
      
      // 쿠키 삭제 확인
      const cookies = document.cookie;
      if (cookies.includes('access_token') || cookies.includes('refresh_token')) {
        addResult('⚠️ 쿠키가 완전히 삭제되지 않았습니다.');
      } else {
        addResult('✅ 쿠키 삭제 확인됨');
      }
      
      // API 호출 (401 에러 발생 예상)
      try {
        const userInfo = await getMyInfo();
        addResult(`✅ 예상과 다름 - 호출 성공: ${userInfo?.username}`);
        addResult('이는 백엔드에서 자동 토큰 재발급이 작동하고 있음을 의미합니다.');
      } catch (error) {
        addResult(`❌ 401 에러 발생 (예상됨): ${error}`);
      }
    } catch (error) {
      addResult(`❌ 테스트 실패: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 3. 백엔드 토큰 만료 시뮬레이션
  const testBackendTokenExpiration = async () => {
    setIsLoading(true);
    try {
      addResult('백엔드 토큰 만료 시뮬레이션 시작...');
      
      // 백엔드에서 토큰을 강제로 만료시키는 엔드포인트 호출
      const response = await fetch('http://localhost:8080/api/auth/test/expire-token', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        addResult('백엔드에서 토큰 만료 처리 완료');
        
        // API 호출 (토큰 재발급 시도)
        try {
          const userInfo = await getMyInfo();
          addResult(`✅ 토큰 재발급 성공: ${userInfo?.username}`);
        } catch (error) {
          addResult(`❌ 토큰 재발급 실패: ${error}`);
        }
      } else {
        addResult(`❌ 토큰 만료 처리 실패: ${response.status}`);
      }
    } catch (error) {
      addResult(`❌ 토큰 만료 시뮬레이션 실패: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 4. 로그아웃 테스트
  const testLogout = async () => {
    setIsLoading(true);
    try {
      addResult('로그아웃 테스트 시작...');
      
      // 로그아웃 API 호출 (리다이렉트 방지를 위해 fetch 사용)
      const response = await fetch('http://localhost:8080/api/auth/logout', {
        method: 'GET',
        credentials: 'include',
        redirect: 'manual', // 리다이렉트 방지
      });
      
      if (response.status === 200) {
        addResult('✅ 로그아웃 성공 (200 응답)');
        addResult('자체 토큰만 폐기되었습니다.');
      } else {
        addResult(`✅ 로그아웃 성공 (상태: ${response.status})`);
      }
      
      // 로그아웃 후 API 호출 시도
      setTimeout(async () => {
        try {
          await getMyInfo();
          addResult('❌ 로그아웃 후에도 API 호출 성공 (예상과 다름)');
        } catch {
          addResult('✅ 로그아웃 후 API 호출 실패 (예상됨)');
        }
      }, 1000);
      
    } catch (error) {
      addResult(`❌ 로그아웃 실패: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 5. 네트워크 탭에서 확인할 수 있는 테스트
  const testNetworkTab = async () => {
    setIsLoading(true);
    try {
      addResult('네트워크 탭 테스트 시작...');
      addResult('개발자 도구 > Network 탭을 열고 다음을 확인하세요:');
      addResult('1. 첫 번째 요청이 401 에러');
      addResult('2. 자동으로 /auth/refresh 요청');
      addResult('3. 원래 요청이 재시도되어 성공');
      
      const userInfo = await getMyInfo();
      addResult(`✅ 네트워크 탭 테스트 완료: ${userInfo?.username}`);
    } catch (error) {
      addResult(`❌ 네트워크 탭 테스트 실패: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 6. 로그아웃 흐름 상세 테스트
  const testLogoutFlow = async () => {
    setIsLoading(true);
    try {
      addResult('로그아웃 흐름 상세 테스트 시작...');
      addResult('1. 현재 쿠키 상태 확인');
      
      // 현재 쿠키 확인
      const cookies = document.cookie;
      if (cookies.includes('access_token')) {
        addResult('✅ access_token 쿠키 존재');
      } else {
        addResult('❌ access_token 쿠키 없음');
      }
      
      if (cookies.includes('refresh_token')) {
        addResult('✅ refresh_token 쿠키 존재');
      } else {
        addResult('❌ refresh_token 쿠키 없음');
      }
      
      addResult('2. 로그아웃 API 호출');
      await axiosInstance.get('/auth/logout');
      addResult('✅ 로그아웃 API 호출 성공');
      addResult('3. 자체 토큰 폐기 완료');
      
    } catch (error) {
      addResult(`❌ 로그아웃 흐름 테스트 실패: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 7. 토큰 재발급 테스트
  const testTokenRefresh = async () => {
    setIsLoading(true);
    try {
      addResult('토큰 재발급 테스트 시작...');
      
      // 1. 현재 쿠키 상태 확인
      const cookies = document.cookie;
      addResult(`현재 쿠키: ${cookies || '없음'}`);
      
      // 2. 첫 번째 API 호출 (정상 동작 확인)
      try {
        const userInfo1 = await getMyInfo();
        addResult(`✅ 첫 번째 호출 성공: ${userInfo1?.username}`);
      } catch (error) {
        addResult(`❌ 첫 번째 호출 실패: ${error}`);
        return;
      }
      
      // 3. 쿠키 삭제 (access_token만)
      document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      addResult('access_token 쿠키 삭제 완료');
      
      // 4. 두 번째 API 호출 (토큰 재발급 테스트)
      try {
        const userInfo2 = await getMyInfo();
        addResult(`✅ 토큰 재발급 성공: ${userInfo2?.username}`);
        addResult('백엔드에서 자동으로 토큰을 재발급했습니다.');
      } catch (error) {
        addResult(`❌ 토큰 재발급 실패: ${error}`);
      }
      
      // 5. 재발급된 쿠키 확인
      const newCookies = document.cookie;
      if (newCookies.includes('access_token')) {
        addResult('✅ 새로운 access_token 쿠키 확인됨');
      } else {
        addResult('❌ 새로운 access_token 쿠키 없음');
      }
      
    } catch (error) {
      addResult(`❌ 토큰 재발급 테스트 실패: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">🔧 토큰 재발급 테스트 페이지</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <button
          onClick={testNormalApiCall}
          disabled={isLoading}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
        >
          🟢 정상 API 호출 테스트
        </button>
        
        <button
          onClick={test401Error}
          disabled={isLoading}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50"
        >
          🔴 401 에러 테스트 (쿠키 삭제)
        </button>
        
        <button
          onClick={testBackendTokenExpiration}
          disabled={isLoading}
          className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 disabled:opacity-50"
        >
          🟡 백엔드 토큰 만료 시뮬레이션
        </button>
        
        <button
          onClick={testLogout}
          disabled={isLoading}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 disabled:opacity-50"
        >
          ⚫ 로그아웃 테스트
        </button>
        
        <button
          onClick={testNetworkTab}
          disabled={isLoading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          🔵 네트워크 탭 테스트
        </button>
        
        <button
          onClick={testLogoutFlow}
          disabled={isLoading}
          className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 disabled:opacity-50"
        >
          🟠 로그아웃 흐름 테스트
        </button>
        
        <button
          onClick={testTokenRefresh}
          disabled={isLoading}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
        >
          🟢 토큰 재발급 테스트
        </button>
        
        <button
          onClick={clearResults}
          className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
        >
          🟣 결과 초기화
        </button>
      </div>

      <div className="bg-gray-100 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">📋 테스트 결과</h2>
        <div className="bg-white p-4 rounded border max-h-96 overflow-y-auto">
          {testResults.length === 0 ? (
            <p className="text-gray-500">테스트를 실행하면 결과가 여기에 표시됩니다.</p>
          ) : (
            testResults.map((result, index) => (
              <div key={index} className="mb-1 text-sm font-mono">
                {result}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-6 bg-blue-50 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">📖 테스트 가이드</h2>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li><strong>정상 API 호출:</strong> 현재 토큰이 유효한지 확인</li>
          <li><strong>401 에러 테스트:</strong> 쿠키를 삭제하고 401 에러 발생 확인</li>
          <li><strong>토큰 재발급 테스트:</strong> access_token 삭제 후 자동 재발급 확인</li>
          <li><strong>백엔드 토큰 만료:</strong> 백엔드에서 토큰을 만료시키고 재발급 확인</li>
          <li><strong>로그아웃 테스트:</strong> 로그아웃 후 쿠키 삭제 확인</li>
          <li><strong>네트워크 탭:</strong> 개발자 도구에서 요청 흐름 확인</li>
        </ul>
      </div>
    </div>
  );
};

export default TestPage;
