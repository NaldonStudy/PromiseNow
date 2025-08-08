import { Fragment, useEffect, useRef } from 'react';
import type { ChatMessageResponse } from '../../../apis/chat/chat.types';
import { isSameMinute } from '../utils/time';
import MessageItem from './MessageItem';

interface Props {
  messages: ChatMessageResponse[];
}

const MessageList = ({ messages }: Props) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'end',
    });
  }, [messages.length]);

  return (
    <div className="flex flex-col gap-1">
      {messages.map((msg, idx) => {
        const prev = messages[idx - 1];
        const isSameSender = prev?.roomUserId === msg.roomUserId;
        const isSameTime = isSameMinute(prev?.sentDate ?? '', msg.sentDate);
        const showMeta = !(isSameSender && isSameTime);
        const key = `${msg.roomUserId}-${msg.sentDate}`;

        return (
          <Fragment key={key}>
            <MessageItem message={msg} showMeta={showMeta} />
          </Fragment>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
};

export default MessageList;
