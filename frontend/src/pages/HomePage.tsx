import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <>
      <div className="text-primary">Promise Now</div>
      <Link to="/1/schedule">누르면 1번 방 입장</Link>
    </>
  );
};

export default HomePage;
