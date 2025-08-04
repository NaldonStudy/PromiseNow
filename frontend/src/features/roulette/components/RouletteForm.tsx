import { useState } from 'react';
import Card from '../../../components/ui/Card';
import Input from '../../../components/ui/Input';
import SquareBtn from '../../../components/ui/SquareBtn';
import { useRouletteStore } from '../roulette.store';

const RouletteForm = () => {
  const [inputValue, setInputValue] = useState('');
  const { options, addOption, removeOption, startSpinning, mustStartSpinning } = useRouletteStore();

  const handleAddOption = () => {
    if (inputValue.trim()) {
      addOption(inputValue.trim());
      setInputValue('');
    }
  };

  const handleStartRoulette = () => {
    if (options.length > 0 && !mustStartSpinning) {
      startSpinning();
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Input
          placeholder="룰렛 선택지를 추가해보세요!"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <SquareBtn
          text={'+'}
          textSize="text-[25px]"
          width="w-13"
          template={'filled'}
          onClick={handleAddOption}
          disabled={!inputValue.trim()}
        />
      </div>

      <div className="my-4 flex flex-col gap-2">
        {options.length === 0 ? (
          <Card className="px-5 py-3 text-sm text-gray-500 text-center">
            추가된 선택지가 없습니다
          </Card>
        ) : (
          options.map((option, index) => (
            <Card key={index} className="px-5 py-3 text-sm flex justify-between items-center">
              <span className="flex-1">{option.option}</span>
              <button
                onClick={() => removeOption(index)}
                className="text-text-dark ml-2 font-bold"
                disabled={mustStartSpinning}
              >
                ×
              </button>
            </Card>
          ))
        )}
      </div>

      <SquareBtn
        text={mustStartSpinning ? '룰렛 돌리는 중...' : '룰렛 돌리기'}
        width="w-full"
        template={'filled'}
        onClick={handleStartRoulette}
        disabled={options.length === 0 || mustStartSpinning}
      />
    </div>
  );
};

export default RouletteForm;
