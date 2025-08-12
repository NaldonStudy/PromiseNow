import { useState } from 'react';
import type { RecommendTime } from '../../../apis/availability/availability.types';

import ScheduleItemHeader from './ScheduleItemHeader';
import ScheduleItemTimeList from './ScheduleItemTimeList';
import Card from '../../../components/ui/Card';

interface Props {
  participant: string;
  timeCount: number;
  ranges: RecommendTime[];
}

const ScheduleRecommendationItem = ({ participant, timeCount, ranges }: Props) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="rounded-xl overflow-hidden mb-3">
      <ScheduleItemHeader
        participant={participant}
        timeCount={timeCount}
        onToggle={() => setExpanded(!expanded)}
        expanded={expanded}
      />
      {expanded && <ScheduleItemTimeList ranges={ranges} />}
    </Card>
  );
};

export default ScheduleRecommendationItem;
