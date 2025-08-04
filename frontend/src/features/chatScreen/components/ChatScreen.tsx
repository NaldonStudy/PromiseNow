import Transmits from './Transmits';

const ChatScreen = () => {
  return (
    <div className="relative h-full">
      {/* 채팅 메시지 영역 */}
      <div className="overflow-y-auto h-full pb-[130px] px-4 pt-2">{/* 메시지 리스트 등 */}</div>

      {/* 하단 고정 Transmits */}
      <div className="fixed bottom-[70px] left-1/2 -translate-x-1/2 w-full max-w-mobile px-4 z-20">
        <Transmits />
      </div>
    </div>
  );
};

export default ChatScreen;
