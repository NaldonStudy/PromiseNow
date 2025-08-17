import { isSameMinute as _isSameMinute, parseISO } from 'date-fns';

// 시간 문자열을 '오전 10:12' 형식으로 변환
export const formatTime = (isoString?: string | Date): string => {
  if (!isoString) return '';

  try {
    let date: Date;
    
    if (typeof isoString === 'string') {
      date = new Date(isoString);
    } else {
      date = isoString;
    }
    
    const hours = date.getHours();
    const minutes = date.getMinutes();

    const ampm = hours < 12 ? '오전' : '오후';
    const displayHour = hours % 12 === 0 ? 12 : hours % 12;
    const displayMinute = minutes.toString().padStart(2, '0');

    return `${ampm} ${displayHour}:${displayMinute}`;
  } catch (error) {
    console.error('formatTime error:', error, 'isoString:', isoString);
    return '';
  }
};

// 두 시간 문자열이 같은 '분'인지 비교
export const isSameMinute = (a?: string | Date, b?: string | Date): boolean => {
  if (!a || !b) return false;

  try {
    let dateA: Date, dateB: Date;
    
    if (typeof a === 'string') {
      dateA = parseISO(a);
    } else {
      dateA = a;
    }
    
    if (typeof b === 'string') {
      dateB = parseISO(b);
    } else {
      dateB = b;
    }

    return _isSameMinute(dateA, dateB);
  } catch (error) {
    console.error('isSameMinute error:', error, 'a:', a, 'b:', b);
    return false;
  }
};
