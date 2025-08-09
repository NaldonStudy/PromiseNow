import { isSameMinute as _isSameMinute, parseISO } from 'date-fns';

// 시간 문자열을 '오전 10:12' 형식으로 변환
export const formatTime = (isoString?: string): string => {
  if (!isoString) return '';

  const date = new Date(isoString);
  const hours = date.getHours();
  const minutes = date.getMinutes();

  const ampm = hours < 12 ? '오전' : '오후';
  const displayHour = hours % 12 === 0 ? 12 : hours % 12;
  const displayMinute = minutes.toString().padStart(2, '0');

  return `${ampm} ${displayHour}:${displayMinute}`;
};

// 두 시간 문자열이 같은 '분'인지 비교
export const isSameMinute = (a?: string, b?: string): boolean => {
  if (!a || !b) return false;
  return _isSameMinute(parseISO(a), parseISO(b));
};
