import { useTitle } from '../hooks/common/useTitle';

import RequireAuth from '../components/RequireAuth';
import RouletteTemplate from './templates/RouletteTemplate';

const RoulettePage = () => {
  useTitle('룰렛 - PromiseNow');

  return (
    <RequireAuth>
      <RouletteTemplate />
    </RequireAuth>
  );
};

export default RoulettePage;
