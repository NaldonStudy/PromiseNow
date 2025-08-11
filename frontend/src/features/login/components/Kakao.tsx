import Icon from "../../../components/ui/Icon";

interface Props {
  onLogin: () => void;
}
const Kakao = ({onLogin}: Props) => {
  
  return (
    <div>
      <button
        className="flex flex-row bg-yellow-300 font-semibold px-5 py-2 text-sm hover:bg-yellow-400 focus:outline-none"
        onClick={onLogin}
      >
        <Icon type="kakaotalk" size={18} color="black" />
        <span className="px-10">카카오로 시작하기</span>
      </button>
    </div>
  );
};

export default Kakao;
