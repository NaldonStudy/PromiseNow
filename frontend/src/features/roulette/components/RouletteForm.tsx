import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import Card from '../../../components/ui/Card';
import Input from '../../../components/ui/Input';
import SquareBtn from '../../../components/ui/SquareBtn';

import { useCreateRoulette, useDeleteRoulette } from '../../../hooks/queries/roulette';
import { useRouletteList } from '../../../hooks/queries/roulette/queries';
import { useRoomUserStore } from '../../../stores/roomUser.store';
import { useRouletteSpinStore } from '../../../stores/roulette.store';

const PALETTE = [
  { bg: 'bg-[var(--color-gray)]', text: 'text-black' },
  { bg: 'bg-[var(--color-primary)]', text: 'text-white' },
  { bg: 'bg-[var(--color-secondary)]', text: 'text-white' },
  { bg: 'bg-[var(--color-point)]', text: 'text-white' },
  { bg: 'bg-[var(--color-gray-input)]', text: 'text-black' },
];

const RouletteForm = () => {
  const { id } = useParams<{ id: string }>();
  const roomId = Number(id);

  const [inputValue, setInputValue] = useState('');

  const { data: rouletteList } = useRouletteList(roomId); // 서버 진실 소스
  const createMutate = useCreateRoulette(roomId);
  const deleteMutate = useDeleteRoulette(roomId);

  const myRoomUserId = useRoomUserStore((s) => s.getRoomUserId(roomId));

  const { mustStartSpinning, startSpinning } = useRouletteSpinStore();

  // 뷰 전용 데이터 (색상만 인덱스 기반으로 부여)
  const viewItems = useMemo(
    () =>
      (rouletteList ?? []).map((it, i) => ({
        rouletteId: it.rouletteId,
        content: it.content,
        roomUserId: it.roomUserId,
        color: PALETTE[i % PALETTE.length],
      })),
    [rouletteList],
  );

  // 내가 이미 하나 추가했는지
  const alreadyMyOption = useMemo(
    () => (rouletteList ?? []).some((it) => it.roomUserId === myRoomUserId),
    [rouletteList, myRoomUserId],
  );

  const handleAddOption = () => {
    if (!myRoomUserId) {
      alert('참여자 정보를 불러올 수 없습니다.');
      return;
    }
    if (alreadyMyOption) {
      alert('이미 선택지를 추가하셨습니다.');
      return;
    }
    const content = inputValue.trim();
    if (!content) return;

    createMutate.mutate({ roomId, roomUserId: myRoomUserId, content });
    setInputValue('');
  };

  const handleRemoveOption = (rouletteId: number, ownerRoomUserId: number) => {
    if (!myRoomUserId) return;
    if (myRoomUserId !== ownerRoomUserId) return; // 안전장치: 본인만 삭제

    deleteMutate.mutate({
      rouletteId,
      payload: { roomId, roomUserId: myRoomUserId },
    });
  };

  const handleStartRoulette = () => {
    startSpinning(viewItems.length);
  };

  // 서버에서 아직 아무것도 없을 때
  const isEmpty = (rouletteList?.length ?? 0) === 0;

  return (
    <div className="p-4">
      {/* 입력 + 추가 */}
      <div className="flex items-center gap-2 mb-4">
        <Input
          placeholder="룰렛 선택지를 추가해보세요!"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <SquareBtn
          text="+"
          textSize="text-[25px]"
          width="w-13"
          template="outlined"
          onClick={handleAddOption}
          disabled={!inputValue.trim() || !myRoomUserId}
        />
      </div>

      {/* 목록 */}
      <div className="my-4 flex flex-col gap-2">
        {isEmpty ? (
          <Card className="px-5 py-3 text-sm text-gray-500 text-center">
            추가된 선택지가 없습니다
          </Card>
        ) : (
          viewItems.map((item, idx) => {
            const isMine = myRoomUserId === item.roomUserId;
            return (
              <Card
                key={item.rouletteId ?? idx}
                className={`px-5 py-3 text-sm flex justify-between items-center border border-gray-dark ${item.color.bg} ${item.color.text}`}
              >
                <span className="flex-1">{item.content}</span>
                {isMine && (
                  <button
                    onClick={() => handleRemoveOption(item.rouletteId!, item.roomUserId)}
                    className="text-text-dark ml-2 font-bold"
                    disabled={mustStartSpinning}
                    aria-label="delete my roulette item"
                  >
                    ×
                  </button>
                )}
              </Card>
            );
          })
        )}
      </div>

      {/* 돌리기 */}
      <SquareBtn
        text={mustStartSpinning ? '룰렛 돌리는 중...' : '룰렛 돌리기'}
        width="w-full"
        template="filled"
        onClick={handleStartRoulette}
        disabled={viewItems.length === 0 || mustStartSpinning}
      />
    </div>
  );
};

export default RouletteForm;
