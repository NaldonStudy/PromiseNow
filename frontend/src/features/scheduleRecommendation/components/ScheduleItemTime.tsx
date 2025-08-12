import { useState } from 'react';
import type { RecommendTime } from '../../../apis/availability/availability.types';
import ModalConfirm from '../../../components/ui/modal/ModalConfirm';

interface Props {
  range: RecommendTime;
  onUpdate: (range: RecommendTime) => void;
}

const ScheduleItemTime = ({ range, onUpdate }: Props) => {
  const [open, setOpen] = useState(false);

  const formatDate = (dateStr: string) => {
    const [, month, day] = dateStr.split('-');
    return `${Number(month)}월 ${Number(day)}일`;
  };

  return (
    <>
      <button
        className="flex items-center justify-center py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl text-sm"
        onClick={() => setOpen(true)}
      >
        {formatDate(range.date)} {range.timeStart} - {range.timeEnd}
      </button>

      <ModalConfirm
        title={`약속 시간을 ${formatDate(range.date)} ${range.timeStart}로 설정할까요?`}
        isOpen={open}
        onConfirm={() => {
          onUpdate(range);
          setOpen(false);
        }}
        onClose={() => setOpen(false)}
      />
    </>
  );
};

export default ScheduleItemTime;
