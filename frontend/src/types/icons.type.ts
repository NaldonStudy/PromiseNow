import type { IconType as ReactIconType } from 'react-icons';
import { BsBell, BsStars } from 'react-icons/bs';
import { CiCamera, CiGrid41 } from 'react-icons/ci';
import {
  FiCalendar,
  FiCamera,
  FiMapPin,
  FiPhoneCall,
  FiPlus,
  FiSettings,
  FiTarget,
} from 'react-icons/fi';
import { GoCopy, GoDependabot } from 'react-icons/go';
import { HiLocationMarker } from 'react-icons/hi';
import { IoMdTime } from 'react-icons/io';
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
import { VscSend } from 'react-icons/vsc';
import { GrPowerReset } from 'react-icons/gr';

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
  | 'camera'
  | 'copy'
  | 'grid'
  | 'bot';

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
  grid: CiGrid41,
};

const chatIcons = {
  send: VscSend,
  camera: CiCamera,
  bot: GoDependabot,
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
  repeat: GrPowerReset,
  ai: BsStars,
  plus: FiPlus,
  bell: BsBell,
  edit: MdEdit,
  kakaotalk: RiKakaoTalkFill,
  close: IoCloseOutline,
  camera: FiCamera,
  copy: GoCopy,
};

export const iconMap: Record<IconType, ReactIconType> = {
  ...arrowIcons,
  ...callIcons,
  ...mapIcons,
  ...generalIcons,
  ...chatIcons,
};
