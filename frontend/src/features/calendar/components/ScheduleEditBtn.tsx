import SquareBtn from '../../../components/ui/SquareBtn';
import { useCalendarStore } from '../calendar.store';

const ScheduleEditBtn = () => {
  const { mode, setMode } = useCalendarStore();
  return (
    <>
      {mode === 'view' ? (
        <SquareBtn
          text="희망 일정 등록하기"
          template="outlined"
          width="w-full"
          height="h-10"
          onClick={() => setMode('edit')}
        />
      ) : (
        <SquareBtn
          text="저장하기"
          template="filled"
          width="w-full"
          height="h-10"
          onClick={() => setMode('view')}
        />
      )}
    </>
  );
};

export default ScheduleEditBtn;
