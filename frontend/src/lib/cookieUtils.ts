/**
 * 쿠키 관련 유틸리티 함수들
 */

/**
 * 특정 쿠키가 존재하는지 확인
 * HttpOnly 쿠키는 JavaScript로 직접 접근할 수 없으므로
 * 간접적인 방법으로 확인
 */
export const hasRefreshToken = (): boolean => {
  // HttpOnly 쿠키는 document.cookie로 접근할 수 없음
  // 대신 refresh_token 쿠키가 있는지 확인하는 간단한 방법
  // 실제로는 서버에서 확인하는 것이 정확함
  return document.cookie.includes('refresh_token=');
};

/**
 * 모든 쿠키를 문자열로 반환 (디버깅용)
 */
export const getAllCookies = (): string => {
  return document.cookie;
};

/**
 * 쿠키에서 특정 값을 추출 (HttpOnly가 아닌 경우만)
 */
export const getCookie = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
};

/**
 * 인증 관련 쿠키가 있는지 확인
 */
export const hasAuthCookies = (): boolean => {
  return document.cookie.includes('access_token=') || document.cookie.includes('refresh_token=');
};
