import CircleBtn from './../../components/ui/CircleBtn';
import Profile from './../../components/ui/Profile';

interface Props {
  imgUrl?: null | string;
}

const ImgEdit = ({ imgUrl }: Props) => {
  return (
    <div className="relative w-fit ">
      <Profile width="w-15" imgUrl={imgUrl} iconSize={28} />

      <div className="absolute -bottom-2 -right-2">
        <CircleBtn iconType="edit" color="primary" iconSize={15} />
      </div>
    </div>
  );
};

export default ImgEdit;
