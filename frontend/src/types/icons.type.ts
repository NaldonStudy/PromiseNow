import type { IconType as ReactIconType } from 'react-icons';
import { BsStars } from 'react-icons/bs';
import { FaRegBell } from 'react-icons/fa';
import { FiCalendar, FiMapPin, FiPhoneCall, FiPlus, FiSettings, FiTarget } from 'react-icons/fi';
import { IoMdRepeat, IoMdTime } from 'react-icons/io';
import {
  IoCloseOutline,
  IoLocationOutline,
  IoMic,
  IoMicOff,
  IoPersonOutline,
  IoFlagSharp,
} from 'react-icons/io5';
import {
  MdChatBubbleOutline,
  MdEdit,
  MdOutlineVideocam,
  MdOutlineVideocamOff,
  MdMyLocation,
} from 'react-icons/md';
import { RiKakaoTalkFill } from 'react-icons/ri';
import { SlArrowDown, SlArrowLeft, SlArrowRight, SlArrowUp } from 'react-icons/sl';
import { HiLocationMarker } from 'react-icons/hi';
import { FiCamera } from 'react-icons/fi';

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
  | 'kakaotalk'
  | 'close'
  | 'marker'
  | 'myLocation'
  | 'flag'
  | 'camera';

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

const mapIcons = {
  myLocation: MdMyLocation,
  flag: IoFlagSharp,
  marker: HiLocationMarker,
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
  close: IoCloseOutline,
  camera: FiCamera,
};

export const iconMap: Record<IconType, ReactIconType> = {
  ...arrowIcons,
  ...callIcons,
  ...mapIcons,
  ...generalIcons,
};
