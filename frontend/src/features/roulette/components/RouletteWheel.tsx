import { useState, useEffect } from 'react';
import { useRouletteStore } from '../roulette.store';
import { FaMapMarker } from 'react-icons/fa';

const RouletteWheel = () => {
  const { options, mustStartSpinning, prizeNumber, stopSpinning } = useRouletteStore();
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);

  useEffect(() => {
    if (mustStartSpinning && !isSpinning) {
      setIsSpinning(true);

      // 룰렛을 여러 바퀴 돌린 후 선택된 번호에 정확히 멈추도록 계산
      const segmentAngle = 360 / options.length;
      const targetAngle = 360 - prizeNumber * segmentAngle - segmentAngle / 2;
      const spins = 5; // 5바퀴 추가 회전
      const finalRotation = rotation + 360 * spins + targetAngle;

      setRotation(finalRotation);

      // 애니메이션 완료 후 콜백 호출
      setTimeout(() => {
        setIsSpinning(false);
        stopSpinning(prizeNumber);
      }, 3000); // 3초 애니메이션
    }
  }, [mustStartSpinning, prizeNumber, options.length, rotation, isSpinning, stopSpinning]);

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

            // 선택지가 하나뿐일 때는 전체 원을 그리기
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

            // 텍스트 위치 계산
            const textAngle = startAngle + segmentAngle / 2;
            const textAngleRad = (textAngle * Math.PI) / 180;
            const textRadius = radius * 0.7;
            const textX = centerX + textRadius * Math.cos(textAngleRad);
            const textY = centerY + textRadius * Math.sin(textAngleRad);

            // 텍스트 길이에 따른 폰트 크기 및 줄바꿈 처리
            const text = option.option;
            let fontSize = 14;
            let lines: string[] = [text];

            // 텍스트가 너무 길면 폰트 크기 줄이기
            if (text.length > 8) {
              fontSize = 12;
            }
            if (text.length > 12) {
              fontSize = 10;
            }
            if (text.length > 16) {
              fontSize = 8;
            }

            // 매우 긴 텍스트는 줄바꿈 처리
            if (text.length > 10) {
              const mid = Math.ceil(text.length / 2);
              let breakPoint = mid;

              // 공백이 있으면 공백에서 줄바꿈
              const spaceIndex = text.indexOf(' ', mid - 3);
              if (spaceIndex !== -1 && spaceIndex < mid + 3) {
                breakPoint = spaceIndex;
              }

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
