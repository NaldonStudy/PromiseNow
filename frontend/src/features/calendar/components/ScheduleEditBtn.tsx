import SquareBtn from '../../../components/ui/SquareBtn';
import { useCalendarStore } from '../calendar.store';

interface ScheduleEditBtnProps {
  onUserSelectionsUpdate: (userSelections: Record<string, boolean[]>) => void;
}

const ScheduleEditBtn = ({ onUserSelectionsUpdate }: ScheduleEditBtnProps) => {
  const { mode, setMode, userSelections } = useCalendarStore();

  const handleSave = () => {
    if (onUserSelectionsUpdate) {
      onUserSelectionsUpdate(userSelections);
    }
    setMode('view');
  };

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
          onClick={handleSave}
        />
      )}
    </>
  );
};

export default ScheduleEditBtn;
