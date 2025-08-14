import type { RecommendTime } from '../../../apis/availability/availability.types';
import ScheduleRecommendationItem from './ScheduleRecommendationItem';

interface Props {
  totalMembers?: number;
  recommendTime?: RecommendTime[];
}

const ScheduleRecommendationList = ({ totalMembers, recommendTime }: Props) => {
  const totalParticipants = totalMembers ? totalMembers : 0;

  const grouped = (recommendTime ?? []).reduce<Record<number, RecommendTime[]>>((acc, cur) => {
    if (!acc[cur.count]) acc[cur.count] = [];
    acc[cur.count].push(cur);
    return acc;
  }, {});

  return (
    <>
      {Object.entries(grouped)
        .sort((a, b) => Number(b[0]) - Number(a[0]))
        .map(([count, ranges]) => (
          <ScheduleRecommendationItem
            key={count}
            participant={`${count}/${totalParticipants}`}
            timeCount={ranges.length}
            ranges={ranges}
          />
        ))}
    </>
  );
};

export default ScheduleRecommendationList;
