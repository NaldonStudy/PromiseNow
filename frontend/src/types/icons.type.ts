import type { IconType as ReactIconType } from 'react-icons';
import { BsFillChatFill, BsStars } from 'react-icons/bs';
import { FiCalendar, FiMapPin, FiPhoneCall, FiPlus, FiSettings, FiTarget } from 'react-icons/fi';
import { IoMdTime, IoMdRepeat } from 'react-icons/io';
import { IoLocationOutline, IoPersonOutline } from 'react-icons/io5';
import { SlArrowLeft, SlArrowRight, SlArrowUp, SlArrowDown } from 'react-icons/sl';
import { FaRegBell } from 'react-icons/fa';

export type IconType =
  | 'left'
  | 'right'
  | 'up'
  | 'down'
  | 'person'
  | 'roulette'
  | 'calendar'
  | 'mappin'
  | 'settings'
  | 'call'
  | 'chat'
  | 'time'
  | 'location'
  | 'repeat'
  | 'ai'
  | 'plus'
  | 'bell';

export const iconMap: Record<IconType, ReactIconType> = {
  left: SlArrowLeft,
  right: SlArrowRight,
  up: SlArrowUp,
  down: SlArrowDown,
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
  ai: BsStars,
  plus: FiPlus,
  bell: FaRegBell,
};
