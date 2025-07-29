import { useState } from 'react';
import ScheduleItemHeader from './ScheduleItemHeader';
import ScheduleItemTimeList from './ScheduleItemTimeList';
import Card from '../../../components/ui/Card';

interface Props {
  participant: string;
  timeCount: number;
  ranges: string[];
}

const ScheduleRecommendationItem = ({ participant, timeCount, ranges }: Props) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="rounded-xl overflow-hidden">
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
