import { Fragment } from 'react';
import type { ChatMessageResponse } from '../../../apis/chat/chat.types';
import { isSameMinute } from '../utils/time';
import MessageItem from './MessageItem';

interface Props {
  messages: ChatMessageResponse[];
}

const MessageList = ({ messages }: Props) => {
  return (
    <div className="flex flex-col gap-1">
      {messages.map((msg, idx) => {
        const prev = messages[idx - 1];
        const isSameSender = prev?.roomUserId === msg.roomUserId;
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
