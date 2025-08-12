import Icon from '../../../components/ui/Icon';

interface Props {
  participant: string;
  timeCount: number;
  onToggle: () => void;
  expanded: boolean;
}

const ScheduleItemHeader = ({ participant, timeCount, onToggle, expanded }: Props) => {
  return (
    <button
      onClick={onToggle}
      className="w-full flex px-10 py-4 justify-between items-center bg-gray text-sm hover:bg-gray-dark/50 transition-colors duration-200"
    >
      <div className="text-left">
        <div className="font-semibold">{participant}명 참여 가능</div>
        <div className="text-xs text-text-dark">가능한 시간 {timeCount}개</div>
      </div>

      <div>
        {expanded ? (
          <Icon type="up" color="text-text-dark" />
        ) : (
          <Icon type="down" color="text-text-dark" />
        )}
      </div>
    </button>
  );
};

export default ScheduleItemHeader;
