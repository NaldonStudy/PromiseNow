interface Props {
  range: string;
}

const ScheduleItemTime = ({ range }: Props) => (
  <div className="flex items-center justify-center py-2 bg-primary/10 text-primary rounded-xl text-sm">
    {range}
  </div>
);

export default ScheduleItemTime;
