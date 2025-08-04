import Icon from '../../ui/Icon';

const CopyCode = () => {
  return (
    <div className="flex justify-center items-center gap-1 text-primary px-3 py-0.5 font-bold text-xs border border-primary rounded-full">
      참여 코드 <Icon type="copy" size={14} color="text-primary" />
    </div>
  );
};

export default CopyCode;
