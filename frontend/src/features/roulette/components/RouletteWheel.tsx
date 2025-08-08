import { useEffect, useMemo, useState } from 'react';
import { FaMapMarker } from 'react-icons/fa';
import { useParams } from 'react-router-dom';

import { useRouletteList } from '../../../hooks/queries/roulette/queries';
import { useRouletteSpinStore } from '../../../stores/roulette.store'; // mustStartSpinning, prizeNumber, stopSpinning

// 색상 팔레트 추가
const PALETTE = [
  { backgroundColor: '#fdf2eb', textColor: '#bb4f15' }, // 연오렌지 / 진갈색
  { backgroundColor: '#f28145', textColor: '#ffffff' }, // 오렌지
  { backgroundColor: '#bb4f15', textColor: '#ffffff' }, // 진갈색
  { backgroundColor: 'var(--color-point)', textColor: '#ffffff' }, // 포인트(보라)
  { backgroundColor: 'var(--color-gray-input)', textColor: '#000000' }, // 연회색
];

const RouletteWheel = () => {
  const { id } = useParams<{ id: string }>();
  const roomId = Number(id);

  // 서버 데이터 가져오기
  const { data: rouletteList = [] } = useRouletteList(roomId);

  const { mustStartSpinning, prizeNumber, stopSpinning } = useRouletteSpinStore();

  // 서버 데이터 → 색상 부여
  const options = useMemo(
    () =>
      rouletteList.map((it, i) => ({
        option: it.content,
        style: {
          backgroundColor: PALETTE[i % PALETTE.length].backgroundColor,
          textColor: PALETTE[i % PALETTE.length].textColor,
        },
      })),
    [rouletteList],
  );

  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);

  useEffect(() => {
    if (mustStartSpinning && !isSpinning && options.length > 0) {
      setIsSpinning(true);

      const segmentAngle = 360 / options.length;
      const targetAngle = 360 - prizeNumber * segmentAngle - segmentAngle / 2;
      const spins = 5;
      const finalRotation = rotation + 360 * spins + targetAngle;

      setRotation(finalRotation);

      setTimeout(() => {
        setIsSpinning(false);
        stopSpinning(prizeNumber);
      }, 3000);
    }
  }, [mustStartSpinning, prizeNumber, options.length, rotation, isSpinning, stopSpinning]);

  if (options.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center text-text-dark">
          <div>룰렛 선택지를 추가해주세요</div>
        </div>
      </div>
    );
  }

  const segmentAngle = 360 / options.length;

  return (
    <div className="flex justify-center items-center">
      <div className="relative">
        {/* 룰렛 원판 */}
        <div
          className="relative w-80 h-80 rounded-full overflow-hidden"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: isSpinning ? 'transform 3s cubic-bezier(0.23, 1, 0.32, 1)' : 'none',
          }}
        >
          {options.map((option, index) => {
            const startAngle = index * segmentAngle;
            const endAngle = (index + 1) * segmentAngle;

            const centerX = 160;
            const centerY = 160;
            const radius = 160;

            if (options.length === 1) {
              return (
                <svg
                  key={index}
                  className="absolute top-0 left-0 w-full h-full"
                  viewBox="0 0 320 320"
                >
                  <circle
                    cx={centerX}
                    cy={centerY}
                    r={radius}
                    fill={option.style?.backgroundColor || '#f3f4f6'}
                    stroke="#ffffff"
                    strokeWidth="2"
                  />
                  <text
                    x={centerX}
                    y={centerY}
                    fill={option.style?.textColor || 'black'}
                    fontSize="16"
                    fontWeight="bold"
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    {option.option}
                  </text>
                </svg>
              );
            }

            const startAngleRad = (startAngle * Math.PI) / 180;
            const endAngleRad = (endAngle * Math.PI) / 180;

            const x1 = centerX + radius * Math.cos(startAngleRad);
            const y1 = centerY + radius * Math.sin(startAngleRad);
            const x2 = centerX + radius * Math.cos(endAngleRad);
            const y2 = centerY + radius * Math.sin(endAngleRad);

            const largeArcFlag = segmentAngle > 180 ? 1 : 0;
            const pathData = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

            const textAngle = startAngle + segmentAngle / 2;
            const textAngleRad = (textAngle * Math.PI) / 180;
            const textRadius = radius * 0.7;
            const textX = centerX + textRadius * Math.cos(textAngleRad);
            const textY = centerY + textRadius * Math.sin(textAngleRad);

            const text = option.option;
            let fontSize = 14;
            let lines: string[] = [text];

            if (text.length > 8) fontSize = 12;
            if (text.length > 12) fontSize = 10;
            if (text.length > 16) fontSize = 8;

            if (text.length > 10) {
              const mid = Math.ceil(text.length / 2);
              let breakPoint = mid;
              const spaceIndex = text.indexOf(' ', mid - 3);
              if (spaceIndex !== -1 && spaceIndex < mid + 3) breakPoint = spaceIndex;
              lines = [text.substring(0, breakPoint).trim(), text.substring(breakPoint).trim()];
            }

            return (
              <svg
                key={index}
                className="absolute top-0 left-0 w-full h-full"
                viewBox="0 0 320 320"
              >
                <path
                  d={pathData}
                  fill={option.style?.backgroundColor || '#f3f4f6'}
                  stroke="#ffffff"
                  strokeWidth="2"
                />
                {lines.map((line, lineIndex) => (
                  <text
                    key={lineIndex}
                    x={textX}
                    y={textY + (lineIndex - (lines.length - 1) / 2) * fontSize * 1.2}
                    fill={option.style?.textColor || 'black'}
                    fontSize={fontSize}
                    fontWeight="bold"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    transform={`rotate(${textAngle}, ${textX}, ${textY})`}
                  >
                    {line}
                  </text>
                ))}
              </svg>
            );
          })}
        </div>

        {/* 포인터 */}
        <div
          className="absolute -top-4 left-1/2 transform -translate-x-1/2 -translate-y-1"
          style={{ zIndex: 10 }}
        >
          <FaMapMarker className="text-red" size={50} />
        </div>
      </div>
    </div>
  );
};

export default RouletteWheel;
