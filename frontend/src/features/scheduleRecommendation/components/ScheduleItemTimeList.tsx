import { useState } from 'react';
import ScheduleItemTime from './ScheduleItemTime';

interface Props {
  ranges: string[];
}

const ScheduleItemTimeList = ({ ranges }: Props) => {
  const [expanded, setExpanded] = useState(false);
  const visibleRanges = expanded ? ranges : ranges.slice(0, 2);
  const showToggle = ranges.length > 3;

  return (
    <div className="px-10 py-5 flex flex-col gap-2">
      {visibleRanges.map((range, i) => (
        <ScheduleItemTime range={range} key={i} />
      ))}

      {showToggle && (
        <button
          className="text-sm text-text-dark self-center mt-2"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? '' : '더 많은 시간 보기'}
        </button>
      )}
    </div>
  );
};

export default ScheduleItemTimeList;
