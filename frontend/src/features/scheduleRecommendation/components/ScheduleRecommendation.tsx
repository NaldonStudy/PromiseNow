import Icon from '../../../components/ui/Icon';
import ScheduleRecommendationList from './ScheduleRecommendationList';

const ScheduleRecommendation = () => {
  return (
    <div>
      <h2 className="flex gap-2 justify-center items-center font-bold text-sm mt-12 mb-5">
        <Icon type="ai" color="text-point" size={20} />
        AI가 추천하는 일정을 확인해보세요!
      </h2>
      <ScheduleRecommendationList />
    </div>
  );
};

export default ScheduleRecommendation;
