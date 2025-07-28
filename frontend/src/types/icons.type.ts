import type { IconType as ReactIconType } from 'react-icons';
import { BsFillChatFill } from 'react-icons/bs';
import { FiCalendar, FiMapPin, FiPhoneCall, FiSettings, FiTarget } from 'react-icons/fi';
import { IoMdTime } from 'react-icons/io';
import { IoLocationOutline, IoPersonOutline } from 'react-icons/io5';
import { SlArrowLeft } from 'react-icons/sl';

export type IconType =
  | 'left'
  | 'person'
  | 'roulette'
  | 'calendar'
  | 'mappin'
  | 'settings'
  | 'call'
  | 'chat'
  | 'time'
  | 'location';

export const iconMap: Record<IconType, ReactIconType> = {
  left: SlArrowLeft,
  person: IoPersonOutline,
  roulette: FiTarget,
  calendar: FiCalendar,
  mappin: FiMapPin,
  settings: FiSettings,
  call: FiPhoneCall,
  chat: BsFillChatFill,
  time: IoMdTime,
  location: IoLocationOutline,
};
