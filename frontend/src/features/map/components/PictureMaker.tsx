import Icon from '../../../components/ui/Icon';

interface PictureMakerProps {
  imageUrl?: string;
}

const PictureMaker = ({ imageUrl = '/default-profile.jpg' }: PictureMakerProps) => {
  return (
    <div className="relative flex flex-col items-center">
      <div
        className="relative bg-white rounded-lg shadow-lg border-2 border-white overflow-hidden"
        style={{ width: 50, height: 50 }}
      >
        <img src={imageUrl} className="w-full h-full object-cover" />
      </div>
      <div className="relative -mt-3.5">
        <Icon type="marker" size={30} color="text-primary" />
      </div>
    </div>
  );
};

export default PictureMaker;
