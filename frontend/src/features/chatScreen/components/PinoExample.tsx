import ProfileName from '../../../components/ui/ProfileName';

const PinoExample = () => {
  return (
    <div className="flex items-center justify-between px-5">
      <ProfileName
        name="피노를 불러보세요!"
        isPino={true}
        iconSize={10}
        textcolor="text-point"
        className="text-xs"
      />
      <div>
        <span className="text-blue-400 text-xs ">@피노</span>
        <span className="text-gray-500 text-xs ">야 빨리 오라고 재촉해줘!! </span>
      </div>
    </div>
  );
};

export default PinoExample;
