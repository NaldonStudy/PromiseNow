import { useRef, useState } from 'react';
import ArrivalRankingItem from './ArrivalRankingItem';
import { MdDragHandle } from 'react-icons/md';

const MIN_HEIGHT = 60;
const MAX_HEIGHT = window.innerHeight * 0.7;

const ArrivalRanking = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number>(window.innerHeight * 0.4);

  const handleMouseDown = (e: React.MouseEvent) => {
    const startY = e.clientY;
    const startHeight = height;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const delta = startY - moveEvent.clientY;
      const newHeight = Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, startHeight + delta));
      setHeight(newHeight);
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  return (
    <div
      ref={containerRef}
      className="rounded-t-3xl bg-white w-full overflow-hidden flex flex-col transition-none"
      style={{ height }}
    >
      <div
        className="flex justify-center items-center cursor-row-resize h-6"
        onMouseDown={handleMouseDown}
      >
        <MdDragHandle size={24} className="text-text-dark" />
      </div>

      <div className="px-6 py-3 overflow-y-auto hide-scrollbar">
        <h2 className="font-bold ml-3 mb-3">도착 랭킹</h2>
        <div className="flex flex-col gap-2">
          <ArrivalRankingItem rank={1} name="이름" progress={30} eta={'12:34'} speed={0} />
          <ArrivalRankingItem rank={2} name="이름" progress={30} eta={'12:34'} speed={0} />
          <ArrivalRankingItem rank={3} name="이름" progress={30} eta={'12:34'} speed={0} />
          <ArrivalRankingItem rank={4} name="이름" progress={30} eta={'12:34'} speed={0} />
        </div>
      </div>
    </div>
  );
};

export default ArrivalRanking;
