import Input from '../../../components/ui/Input';
import SquareBtn from '../../../components/ui/SquareBtn';

const RoomFind = () => {
  return (
    <div className="flex items-center px-10 py-4 gap-4 pt-10 pb-7">
      <Input placeholder="참여 코드를 입력하세요" />
      <SquareBtn text="참여" template="filled" width="w-20" />
    </div>
  );
};

export default RoomFind;
