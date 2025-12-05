import { useState } from 'react';
import { useParams } from 'react-router-dom';
import type { RecommendTime } from '../../../apis/availability/availability.types';

import ScheduleItemTime from './ScheduleItemTime';
import { useUpdateAppointment } from '../../../hooks/queries/room';

interface Props {
  ranges: RecommendTime[];
}

const ScheduleItemTimeList = ({ ranges }: Props) => {
  const [expanded, setExpanded] = useState(false);
  const visibleRanges = expanded ? ranges : ranges.slice(0, 2);
  const showToggle = ranges.length > 3;

  const { id } = useParams<{ id: string }>();
  const roomId = Number(id);
  const updateAppointmentMutation = useUpdateAppointment(roomId);

  const handleUpdate = (range: RecommendTime) => {
    updateAppointmentMutation.mutate({
      locationDate: range.date,
      locationTime: range.timeStart,
    });
  };

  return (
    <div className="px-10 py-5 flex flex-col gap-2">
      {visibleRanges.map((range, i) => (
        <ScheduleItemTime range={range} key={i} onUpdate={handleUpdate} />
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
