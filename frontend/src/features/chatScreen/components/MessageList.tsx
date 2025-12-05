import { Fragment, useEffect, useRef } from 'react';
import type { ChatMessageResponse } from '../../../apis/chat/chat.types';
import { isSameMinute } from '../utils/time';
import MessageItem from './MessageItem';

interface Props {
  messages: ChatMessageResponse[];
    onMediaLoad?: () => void;

}

const MessageList = ({ messages, onMediaLoad }: Props) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'end',
    });
  }, [messages.length]);

  const authorKey = (m?: ChatMessageResponse) =>
    !m ? null : m.type === 'PINO' ? 'PINO' : m.roomUserId;

  return (
    <div className="flex flex-col gap-1 flex-1 justify-end">
      {messages.map((msg, idx) => {
        const prev = messages[idx - 1];

        const sameAuthor = authorKey(prev) === authorKey(msg);
        const sameMinute = prev ? isSameMinute(prev.sentDate, msg.sentDate) : false;

        const baseShowMeta = !(sameAuthor && sameMinute);
        const showMeta = msg.type === 'PINO' ? true : baseShowMeta;

        const key = `${authorKey(msg)}-${msg.sentDate}-${idx}`;

        return (
          <Fragment key={key}>
  <MessageItem message={msg} showMeta={showMeta} onMediaLoad={onMediaLoad} />          </Fragment>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
};

export default MessageList;
