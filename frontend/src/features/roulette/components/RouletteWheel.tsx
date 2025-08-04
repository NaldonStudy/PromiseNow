import { Wheel } from 'react-custom-roulette';
import { useRouletteStore } from '../roulette.store';

const RouletteWheel = () => {
  const { options, mustStartSpinning, prizeNumber, stopSpinning } = useRouletteStore();

  const handleStopSpinning = () => {
    stopSpinning(prizeNumber);
  };

  // 옵션이 없을 때 기본 표시
  if (options.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center text-text-dark">
          <div>룰렛 선택지를 추가해주세요</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center">
      <Wheel
        mustStartSpinning={mustStartSpinning}
        prizeNumber={prizeNumber}
        data={options}
        onStopSpinning={handleStopSpinning}
        backgroundColors={['#3e3e3e', '#df3428']}
        outerBorderWidth={2}
        outerBorderColor={'#ffffff'}
        radiusLineColor={'#ffffff'}
        radiusLineWidth={5}
      />
    </div>
  );
};

export default RouletteWheel;
