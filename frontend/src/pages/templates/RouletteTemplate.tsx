import RoomLayout from '../../components/layout/RoomLayout';
import RouletteForm from '../../features/roulette/components/RouletteForm';
import RouletteWheel from '../../features/roulette/components/RouletteWheel';

const RouletteTemplate = () => {
  return (
    <RoomLayout>
      <div className="p-10 flex flex-col gap-5">
        <RouletteForm />
        <RouletteWheel />
      </div>
    </RoomLayout>
  );
};

export default RouletteTemplate;
