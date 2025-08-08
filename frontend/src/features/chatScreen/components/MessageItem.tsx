import type { FC } from 'react';
import type { ChatMessageResponse } from '../../../apis/chat/chat.types';
import Profile from '../../../components/ui/Profile';
import { formatTime } from '../utils/time';

interface Props {
  message: ChatMessageResponse;
  showMeta: boolean;
}

const MessageItem: FC<Props> = ({ message, showMeta }) => {
  const { content, type, imageUrl, nickname, sentDate } = message;

  const isPinoMention = content?.startsWith('@피노');
  const isFromPino = type === 'PINO';

  const renderTextWithMention = () => {
    if (isPinoMention) {
      const mention = content.slice(0, 3); // "@피노"
      const rest = content.slice(3); // 나머지
      return (
        <div className="text-sm">
          <span className="text-blue-400">{mention}</span>
          <span className="text-black">{rest}</span>
        </div>
      );
    }

    return <div className="text-sm text-black">{content}</div>;
  };

  return (
    <div className={`flex justify-start ${showMeta ? 'mt-1' : ''}`}>
      <div className="flex flex-col w-full">
        {showMeta && (
          <div className="flex items-center gap-2 mb-1">
            <Profile width="w-6" isPino={isFromPino} />
            <span className="text-sm-10 text-black font-medium">{nickname}</span>
            <span className="text-[10px] text-gray-400">{formatTime(sentDate)}</span>
          </div>
        )}

        {/* 텍스트 영역 */}
        <div className={`w-fit whitespace-pre-line ${showMeta ? 'pl-10' : 'pl-10'}`}>
          {type === 'IMAGE' && imageUrl ? (
            <img src={imageUrl} alt="chat" className="w-60 rounded-md" />
          ) : isFromPino ? (
            <div className="text-sm text-blue-400">{content}</div>
          ) : (
            renderTextWithMention()
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageItem;
