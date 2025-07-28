import type { IconType as ReactIconType } from 'react-icons';
import { BsFillChatFill } from 'react-icons/bs';
import { FiCalendar, FiMapPin, FiPhoneCall, FiSettings, FiTarget } from 'react-icons/fi';
import { IoMdTime, IoMdRepeat } from 'react-icons/io';
import { IoLocationOutline, IoPersonOutline } from 'react-icons/io5';
import { SlArrowLeft, SlArrowRight } from 'react-icons/sl';

export type IconType =
  | 'left'
  | 'right'
  | 'person'
  | 'roulette'
  | 'calendar'
  | 'mappin'
  | 'settings'
  | 'call'
  | 'chat'
  | 'time'
  | 'location'
  | 'repeat';

export const iconMap: Record<IconType, ReactIconType> = {
  left: SlArrowLeft,
  right: SlArrowRight,
  person: IoPersonOutline,
  roulette: FiTarget,
  calendar: FiCalendar,
  mappin: FiMapPin,
  settings: FiSettings,
  call: FiPhoneCall,
  chat: BsFillChatFill,
  time: IoMdTime,
  location: IoLocationOutline,
  repeat: IoMdRepeat,
};
