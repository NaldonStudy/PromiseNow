import ImgEdit from './ImgEdit';
import NameEdit from './NameEdit';

const ProfileEdit = () => {
  return (
    <div className="flex items-center gap-8 px-5 py-5 border-b border-gray-dark">
        <ImgEdit imgUrl={null}/>
      <div className=''>
      <NameEdit name='김싸피'/>
      </div>
    </div>
  );
};

export default ProfileEdit;
