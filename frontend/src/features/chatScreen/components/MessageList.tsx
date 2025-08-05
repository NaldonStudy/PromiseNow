import { Fragment } from 'react';
import type { ChatMessage } from '../../../types/chat.type';
import { isSameMinute } from '../utils/time';
import MessageItem from './MessageItem';

interface Props {
  messages: ChatMessage[];
  myUserId: number; // 안 써도 되지만 유지해도 무방
}

const MessageList = ({ messages }: Props) => {
  return (
    <div className="flex flex-col gap-1">
      {messages.map((msg, idx) => {
        const prev = messages[idx - 1];
        const isSameSender = prev?.userId === msg.userId;
        const isSameTime = isSameMinute(prev?.sentDate ?? '', msg.sentDate);
        const showMeta = !(isSameSender && isSameTime);

        return (
          <Fragment key={idx}>
            <MessageItem message={msg} showMeta={showMeta} />
          </Fragment>
        );
      })}
    </div>
  );
};

export default MessageList;
