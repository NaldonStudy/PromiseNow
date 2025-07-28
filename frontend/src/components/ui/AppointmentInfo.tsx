import IconTextItem from './IconTextItem';

interface Props {
  iconColor: string;
  textColor: string;
  iconSize?: number;
  textSize?: string;
  calenderText?: string;
  timeText?: string;
  locationText?: string;
}

const AppointmentInfo = ({
  iconColor,
  textColor,
  iconSize = 18,
  textSize = 'text-sm',
  calenderText = '확정된 날짜가 없습니다.',
  timeText = '확정된 시간이 없습니다.',
  locationText = '확정된 장소가 없습니다.',
}: Props): React.ReactElement => {
  return (
    <div className="flex flex-col gap-1">
      <IconTextItem
        type="calendar"
        text={calenderText}
        iconSize={iconSize}
        textSize={textSize}
        textColor={textColor}
        iconColor={iconColor}
      />
      <IconTextItem
        type="time"
        text={timeText}
        iconSize={iconSize}
        textSize={textSize}
        textColor={textColor}
        iconColor={iconColor}
      />
      <IconTextItem
        type="location"
        text={locationText}
        iconSize={iconSize}
        textSize={textSize}
        textColor={textColor}
        iconColor={iconColor}
      />
    </div>
  );
};

export default AppointmentInfo;
