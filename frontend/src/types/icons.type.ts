import type { IconType as ReactIconType } from 'react-icons';
import { BsStars } from 'react-icons/bs';
import { FaRegBell } from 'react-icons/fa';
import { FiCalendar, FiMapPin, FiPhoneCall, FiPlus, FiSettings, FiTarget } from 'react-icons/fi';
import { IoMdRepeat, IoMdTime } from 'react-icons/io';
import { IoLocationOutline, IoPersonOutline, IoMic, IoMicOff } from 'react-icons/io5';
import {
  MdEdit,
  MdOutlineVideocam,
  MdOutlineVideocamOff,
  MdChatBubbleOutline,
} from 'react-icons/md';
import { SlArrowDown, SlArrowLeft, SlArrowRight, SlArrowUp } from 'react-icons/sl';
import { RiKakaoTalkFill } from 'react-icons/ri';

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
  | 'bell'
  | 'edit'
  | 'mic'
  | 'micOff'
  | 'video'
  | 'videoOff'
  | 'kakaotalk';

const arrowIcons = {
  left: SlArrowLeft,
  right: SlArrowRight,
  up: SlArrowUp,
  down: SlArrowDown,
};

const callIcons = {
  call: FiPhoneCall,
  mic: IoMic,
  micOff: IoMicOff,
  video: MdOutlineVideocam,
  videoOff: MdOutlineVideocamOff,
};

const generalIcons = {
  person: IoPersonOutline,
  roulette: FiTarget,
  calendar: FiCalendar,
  mappin: FiMapPin,
  settings: FiSettings,
  chat: MdChatBubbleOutline,
  time: IoMdTime,
  location: IoLocationOutline,
  repeat: IoMdRepeat,
  ai: BsStars,
  plus: FiPlus,
  bell: FaRegBell,
  edit: MdEdit,
  kakaotalk: RiKakaoTalkFill,
};

export const iconMap: Record<IconType, ReactIconType> = {
  ...arrowIcons,
  ...callIcons,
  ...generalIcons,
};
