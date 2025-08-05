import type { FC } from 'react';
import Profile from '../../../components/ui/Profile';
import { formatTime } from '../utils/time';
import type { MessageResponseDto } from './../../../types/chat.type';
interface Props {
  message: MessageResponseDto;
  showMeta: boolean;
}

const MessageItem: FC<Props> = ({ message, showMeta }) => {
  const { content, type, imageUrl, nickname, sentDate } = message;

  return (
    <div className={`flex justify-start ${showMeta ? 'mt-1' : ''}`}>
      <div className="flex flex-col w-full">
        {showMeta && (
          <div className="flex items-center gap-2 mb-1">
            <Profile width="w-6" />
            <span className="text-sm-10 text-black font-medium">{nickname}</span>
            <span className="text-[10px] text-gray-400">{formatTime(sentDate)}</span>
          </div>
        )}

        {/* 텍스트 영역 */}
        <div className={`w-fit whitespace-pre-line ${showMeta ? 'pl-10' : 'pl-10'}`}>
          {type === 'IMAGE' && imageUrl ? (
            <img src={imageUrl} alt="chat" className="w-60 rounded-md" />
          ) : (
            <div className="text-sm text-black">{content}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageItem;
