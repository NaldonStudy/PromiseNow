import Icon from '../../../components/ui/Icon';

interface Props {
  participant: string;
  timeCount: number;
  onToggle: () => void;
  expanded: boolean;
}

const ScheduleItemHeader = ({ participant, timeCount, onToggle, expanded }: Props) => {
  return (
    <div className="flex px-10 py-4 justify-between items-center bg-gray text-sm hover:bg-gray-dark/50 transition-colors duration-200">
      <div>
        <div className="font-semibold">{participant}명 참여 가능</div>
        <div className="text-xs text-text-dark">가능한 시간 {timeCount}개</div>
      </div>

      <button onClick={onToggle}>
        {expanded ? (
          <Icon type="up" color="text-text-dark" />
        ) : (
          <Icon type="down" color="text-text-dark" />
        )}
      </button>
    </div>
  );
};

export default ScheduleItemHeader;
