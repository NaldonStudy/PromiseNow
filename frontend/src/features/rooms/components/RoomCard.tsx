import { Link } from 'react-router-dom';
import AppointmentInfo from '../../../components/ui/AppointmentInfo';
import Card from '../../../components/ui/Card';
import Profile from '../../../components/ui/Profile';

interface Props {
  id: number;
  roomTitle: string;
  participantSummary: string;
  locationDate: string | null;
  locationTime: string | null;
  locationName: string | null;
}

const RoomCard = ({
  id,
  roomTitle,
  participantSummary,
  locationDate,
  locationTime,
  locationName,
}: Props): React.ReactElement => {
  const now = new Date();
  const date = locationDate ? new Date(locationDate) : null;
  const isPast = date ? date < now : false;

  const formattedDate = date
    ? date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      })
    : '확정되지 않았습니다';

  const formattedTime = locationTime ? locationTime : '확정되지 않았습니다';

  const formattedLocation = locationName || '확정되지 않았습니다';
  const cardOpacityClass = isPast ? 'opacity-50' : 'opacity-100';

  return (
    <div className="flex justify-center pt-3">
      <Link to={`/${id}/schedule`} className="w-full max-w-3xl">
        <Card
          className={`flex justify-between items-center gap-6 px-3 py-4 w-full transition-opacity duration-300 ${cardOpacityClass}`}
        >
          {/* 좌측 */}
          <div className="flex flex-col items-start gap-2 w-2/5 pl-2">
            <span className="font-bold text-base">{roomTitle}</span>
            <div className="flex items-center gap-1 w-full">
              <div className="w-1/4 flex justify-center">
                <Profile width="w-4" iconSize={10} />
              </div>
              <div className="w-3/4 text-xs">{participantSummary}</div>
            </div>
          </div>

          <div className="border-l h-16 border-gray-dark" />

          <div className="w-3/5">
            <AppointmentInfo
              iconColor="text-secondary"
              textColor="text-black"
              iconSize={13}
              textSize="text-xs"
              calenderText={formattedDate}
              timeText={formattedTime}
              locationText={formattedLocation}
            />
          </div>
        </Card>
      </Link>
    </div>
  );
};

export default RoomCard;
