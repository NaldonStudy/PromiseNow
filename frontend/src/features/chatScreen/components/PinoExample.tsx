import Icon from './../../../components/ui/Icon';

const PinoExample = () => {
  return (
    <div className="flex items-center justify-between px-5">
      <div className="flex items-center gap-1">
        <Icon type="bot" size={15} color="text-point" />
        <span className="text-point text-xs ">피노를 불러보세요!</span>
      </div>
      <div>
        <span className="text-blue-400 text-xs ">@피노</span>
        <span className="text-gray-500 text-xs ">야 빨리 오라고 재촉해줘!! </span>
      </div>
    </div>
  );
};

export default PinoExample;
