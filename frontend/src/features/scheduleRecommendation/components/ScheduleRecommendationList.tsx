import ScheduleRecommendationItem from './ScheduleRecommendationItem';

import { dummyRanges } from '../dummy';

const ScheduleRecommendationList = () => {
  return (
    <>
      <ScheduleRecommendationItem participant="8/8" timeCount={7} ranges={dummyRanges} />
    </>
  );
};

export default ScheduleRecommendationList;
