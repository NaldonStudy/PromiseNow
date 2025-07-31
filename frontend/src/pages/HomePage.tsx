import { dummy } from '../features/rooms/dummy';
import HomeTemplate from './templates/HomeTemplate';

const HomePage = () => {
  return <HomeTemplate rooms={dummy} />;
};

export default HomePage;
