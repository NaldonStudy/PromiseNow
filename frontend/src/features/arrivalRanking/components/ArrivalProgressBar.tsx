interface Props {
  progress?: number; // 0~100 (%)
}

const ArrivalProgressBar = ({ progress = 0 }: Props) => {
  return (
    <div className="w-full h-2.5 mt-2 bg-gray-dark rounded-full overflow-hidden">
      <div
        className="h-full bg-primary transition-all duration-300 rounded-full"
        style={{ width: `${Math.min(progress, 100)}%` }}
      />
    </div>
  );
};

export default ArrivalProgressBar;
