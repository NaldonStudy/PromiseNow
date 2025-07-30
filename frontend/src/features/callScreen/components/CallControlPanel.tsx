import CircleBtn from '../../../components/ui/CircleBtn';

const CallControlPanel = () => {
  return (
    <div className="absolute bottom-7 left-0 w-full px-7 flex justify-between items-end">
      <div className="flex gap-4 items-end">
        <CircleBtn iconType={'micOff'} color={'primary'} />
        <CircleBtn iconType={'video'} color={'white'} />
      </div>
      <CircleBtn iconType={'chat'} color={'point'} iconSize={39} />
    </div>
  );
};

export default CallControlPanel;
