import CircleBtn from './../../../components/ui/CircleBtn';
import Input from './../../../components/ui/Input';

const Transmits = () => {
  return (
    <div className="flex items-center gap-5 px-3 py-5">
      <CircleBtn iconType="camera" color="white" />
      <Input placeholder="메세지를 작성하세요" className="bg-white" />
      <CircleBtn iconType="send" color="primary" />
    </div>
  );
};

export default Transmits;
