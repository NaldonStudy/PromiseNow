import { useTitle } from '../hooks/common/useTitle';
import RouletteTemplate from './templates/RouletteTemplate';

const RoulettePage = () => {
  useTitle('룰렛 - PromiseNow');

  return <RouletteTemplate />;
};

export default RoulettePage;
