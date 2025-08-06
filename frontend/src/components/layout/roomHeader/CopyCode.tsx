import Icon from '../../ui/Icon';

interface Props {
  inviteCode: string | undefined;
}

const CopyCode = ({ inviteCode }: Props) => {
  const handleCopyCode = async () => {
    if (!inviteCode) {
      alert('초대 코드가 없습니다.');
      return;
    }

    try {
      await navigator.clipboard.writeText(inviteCode);
      alert('초대 코드가 복사되었습니다!');
    } catch (error) {
      console.error('복사 실패:', error);
      alert('복사에 실패했습니다.');
    }
  };

  return (
    <div
      className="flex justify-center items-center gap-1 text-primary px-3 py-0.5 font-bold text-xs border border-primary rounded-full cursor-pointer"
      onClick={handleCopyCode}
    >
      참여 코드 <Icon type="copy" size={14} color="text-primary" />
    </div>
  );
};

export default CopyCode;
