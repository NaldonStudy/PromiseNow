const NotFoundTemplate = () => {
  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="flex flex-col justify-center items-center h-screen">
      <p className="text-primary font-bold text-2xl">404 ERROR</p>
      <p className="text-gray-600">페이지를 찾을 수 없습니다</p>
      <p className="text-gray-400 underline text-xs mt-3 cursor-pointer" onClick={handleGoHome}>
        홈으로 돌아가기
      </p>
    </div>
  );
};

export default NotFoundTemplate;
