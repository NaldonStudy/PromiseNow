import { Link } from 'react-router-dom';
import Card from './../components/ui/Card';
import Input from './../components/ui/Input';
import SquareBtn from './../components/ui/SquareBtn';

const HomePage = () => {
  return (
    <>
      <div className="text-white font-bold px-2 py-3 bg-primary">Promise Now</div>
      <div className="flex items-center px-10 py-4 gap-4">
        <Input placeholder="참여 코드를 입력하세요" />
        <SquareBtn text="참여" template="filled" className="w-20 h-10" />
      </div>
      <div className="flex px-10 py-10">
        {/* for 문으로 묶기 */}
        <Link to="/1/schedule">
          <div className="flex px-10">
            <Card className="">
              <Input />
            </Card>
          </div>
        </Link>
      </div>
    </>
  );
};

export default HomePage;
