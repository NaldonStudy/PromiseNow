import type { IconType as ReactIconType } from 'react-icons';
import { BsStars } from 'react-icons/bs';
import { FaRegBell } from 'react-icons/fa';
import { FiCalendar, FiMapPin, FiPhoneCall, FiPlus, FiSettings, FiTarget } from 'react-icons/fi';
import { HiLocationMarker } from 'react-icons/hi';
import { IoMdRepeat, IoMdTime } from 'react-icons/io';
import {
  IoCloseOutline,
  IoFlagSharp,
  IoLocationOutline,
  IoMic,
  IoMicOff,
  IoPersonOutline,
} from 'react-icons/io5';
import {
  MdChatBubbleOutline,
  MdEdit,
  MdMyLocation,
  MdOutlineVideocam,
  MdOutlineVideocamOff,
} from 'react-icons/md';
import { RiKakaoTalkFill } from 'react-icons/ri';
import { SlArrowDown, SlArrowLeft, SlArrowRight, SlArrowUp } from 'react-icons/sl';

import { CiCamera } from 'react-icons/ci';
import { FiCamera } from 'react-icons/fi';
import { VscSend } from 'react-icons/vsc';

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
  | 'send'
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

const chatIcons = {
  send: VscSend,
  camera: CiCamera,
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
  ...chatIcons,
};
