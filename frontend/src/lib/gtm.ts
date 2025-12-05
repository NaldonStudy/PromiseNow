// Google Analytics 4 이벤트 추적 유틸리티

declare global {
  interface Window {
    gtag: (command: string, targetId: string, config?: Record<string, unknown>) => void;
  }
}

// 기본 이벤트 추적 함수
export const trackEvent = (eventName: string, parameters?: Record<string, unknown>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, parameters);
  }
};

// 페이지뷰 추적
export const trackPageView = (pagePath: string, pageTitle?: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', 'G-QDB61LG4QC', {
      page_path: pagePath,
      page_title: pageTitle || document.title
    });
  }
};

// 버튼 클릭 추적
export const trackButtonClick = (buttonName: string, pagePath?: string) => {
  trackEvent('button_click', {
    button_name: buttonName,
    page_path: pagePath || window.location.pathname
  });
};

// 폼 제출 추적
export const trackFormSubmit = (formName: string, pagePath?: string) => {
  trackEvent('form_submit', {
    form_name: formName,
    page_path: pagePath || window.location.pathname
  });
};

// 사용자 로그인 추적
export const trackLogin = (method: string) => {
  trackEvent('login', {
    method: method
  });
};

// 사용자 회원가입 추적
export const trackSignUp = (method: string) => {
  trackEvent('sign_up', {
    method: method
  });
};

// 파일 업로드 추적
export const trackFileUpload = (fileType: string, fileSize?: number) => {
  trackEvent('file_upload', {
    file_type: fileType,
    file_size: fileSize
  });
};

// 에러 추적
export const trackError = (errorMessage: string, errorCode?: string) => {
  trackEvent('error', {
    error_message: errorMessage,
    error_code: errorCode
  });
};
