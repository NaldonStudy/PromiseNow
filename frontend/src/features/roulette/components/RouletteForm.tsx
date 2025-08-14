import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import Card from '../../../components/ui/Card';
import Input from '../../../components/ui/Input';
import SquareBtn from '../../../components/ui/SquareBtn';

import { useCreateRoulette, useDeleteRoulette } from '../../../hooks/queries/roulette';
import { useRouletteList } from '../../../hooks/queries/roulette/queries';
import { useRouletteSpinStore } from '../../../stores/roulette.store';
import { useRoomUserInfo } from '../../../hooks/queries/room';
import { useUserStore } from '../../../stores/user.store';

const RouletteForm = () => {
  const { id } = useParams<{ id: string }>();
  const roomId = Number(id);
  const { user } = useUserStore();
  const roomUserId = useRoomUserInfo(roomId, user?.userId || 0).data?.roomUserId;

  const [inputValue, setInputValue] = useState('');

  const { data: rouletteList } = useRouletteList(roomId);
  const createMutate = useCreateRoulette(roomId);
  const deleteMutate = useDeleteRoulette(roomId);

  const { mustStartSpinning, startSpinning } = useRouletteSpinStore();

  const viewItems = useMemo(
    () =>
      (rouletteList ?? []).map((it) => ({
        rouletteId: it.rouletteId,
        content: it.content,
        roomUserId: it.roomUserId,
      })),
    [rouletteList],
  );

  const alreadyMyOption = useMemo(
    () => (rouletteList ?? []).some((it) => it.roomUserId === roomUserId),
    [rouletteList, roomUserId],
  );

  const handleAddOption = () => {
    if (!roomUserId) {
      alert('참여자 정보를 불러올 수 없습니다.');
      return;
    }
    if (alreadyMyOption) {
      alert('이미 선택지를 추가하셨습니다.');
      return;
    }
    const content = inputValue.trim();
    if (!content) return;

    createMutate.mutate({ roomId, roomUserId: roomUserId, content });
    setInputValue('');
  };

  const handleRemoveOption = (rouletteId: number, ownerRoomUserId: number) => {
    if (!roomUserId) return;
    if (roomUserId !== ownerRoomUserId) return;

    deleteMutate.mutate({
      rouletteId,
      payload: { roomId, roomUserId: roomUserId },
    });
  };

  const handleStartRoulette = () => {
    startSpinning(viewItems.length);
  };

  const isEmpty = (rouletteList?.length ?? 0) === 0;

  return (
    <div className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <Input
          placeholder="룰렛 선택지를 추가해보세요!"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <SquareBtn
          text="+"
          textSize="text-2xl"
          width="w-13"
          template="outlined"
          onClick={handleAddOption}
          disabled={!inputValue.trim() || !roomUserId}
        />
      </div>

      <div className="my-4 flex flex-col gap-2">
        {isEmpty ? (
          <Card className="px-5 py-3 text-sm text-gray-500 text-center">
            추가된 선택지가 없습니다
          </Card>
        ) : (
          viewItems.map((item, idx) => {
            const isMine = roomUserId === item.roomUserId;
            return (
              <Card
                key={item.rouletteId ?? idx}
                className="px-5 py-3 text-sm flex justify-between items-center border border-gray-dark bg-white"
              >
                <span className="flex-1 text-black">{item.content}</span>
                {isMine && (
                  <button
                    onClick={() => handleRemoveOption(item.rouletteId!, item.roomUserId)}
                    className="text-black ml-2 font-bold"
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
