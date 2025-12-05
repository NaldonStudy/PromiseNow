import type { RecommendTimeResponse } from '../../../apis/availability/availability.types';

import Icon from '../../../components/ui/Icon';
import ScheduleRecommendationList from './ScheduleRecommendationList';

interface Props {
  totalMembers?: number;
  recommendTimeData?: RecommendTimeResponse;
}

const ScheduleRecommendation = ({ totalMembers, recommendTimeData }: Props) => {
  return (
    <div>
      <h2 className="flex gap-2 justify-center items-center font-bold text-sm mt-12 mb-5">
        <Icon type="ai" color="text-point" size={20} />
        추천 일정을 확인해보세요!
      </h2>
      <ScheduleRecommendationList
        totalMembers={totalMembers}
        recommendTime={recommendTimeData?.times}
      />
    </div>
  );
};

export default ScheduleRecommendation;
