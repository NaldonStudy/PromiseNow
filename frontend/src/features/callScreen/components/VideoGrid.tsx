import { useCallScreenStore } from '../callScreen.store';

import VideoTile from './VideoTile';

interface Participant {
  id: string;
  name: string;
  isOnline: boolean;
  isMicMuted: boolean;
  isVideoMuted: boolean;
  videoStream: MediaStream | null;
}

interface Props {
  participants?: Participant[];
}

const VideoGrid = ({ participants = [] }: Props) => {
  const { viewMode, selectedParticipantId, setSelectedParticipant } = useCallScreenStore();
  const participantCount = participants.length;

  const handleParticipantClick = (participantId: string) => {
    setSelectedParticipant(participantId);
  };

  // Spotlight 모드
  if (viewMode === 'spotlight' && selectedParticipantId) {
    const selectedParticipant = participants.find((p) => p.id === selectedParticipantId);
    const otherParticipants = participants.filter((p) => p.id !== selectedParticipantId);
    const otherCount = otherParticipants.length;

    return (
      <div className="flex flex-col h-full">
        {/* 상단: 나머지 참가자들 일렬 */}
        <div className="h-32 flex overflow-x-auto hide-scrollbar select-none">
          {otherParticipants.map((participant) => (
            <div
              key={participant.id}
              className={`flex-shrink-0 h-full ${otherCount === 3 ? 'w-1/3' : 'w-31'}`}
            >
              <VideoTile
                id={participant.id}
                name={participant.name}
                isOnline={participant.isOnline}
                isMicMuted={participant.isMicMuted}
                isVideoMuted={participant.isVideoMuted}
                videoStream={participant.videoStream}
                onClick={handleParticipantClick}
              />
            </div>
          ))}
        </div>

        {/* 하단: 선택된 참가자 */}
        <div className="flex-1">
          {selectedParticipant && (
            <VideoTile
              id={selectedParticipant.id}
              name={selectedParticipant.name}
              isOnline={selectedParticipant.isOnline}
              isMicMuted={selectedParticipant.isMicMuted}
              isVideoMuted={selectedParticipant.isVideoMuted}
              videoStream={selectedParticipant.videoStream}
              onClick={handleParticipantClick}
            />
          )}
        </div>
      </div>
    );
  }

  // 참가자가 1명일 때: 전체화면
  if (participantCount === 1) {
    const onlyParticipant = participants[0];
    return (
      <div className="w-full h-full">
        <VideoTile
          id={onlyParticipant.id}
          name={onlyParticipant.name}
          isOnline={onlyParticipant.isOnline}
          isMicMuted={onlyParticipant.isMicMuted}
          isVideoMuted={onlyParticipant.isVideoMuted}
          videoStream={onlyParticipant.videoStream}
          onClick={handleParticipantClick}
        />
      </div>
    );
  }

  // Grid 모드
  // 홀수명: 상단 1명 + 하단 2열 grid
  if (participantCount % 2 !== 0) {
    const topParticipant = participants[0];
    const bottomParticipants = participants.slice(1);

    return (
      <div className="flex flex-col h-full">
        <div className="flex-1">
          <VideoTile
            id={topParticipant.id}
            name={topParticipant.name}
            isOnline={topParticipant.isOnline}
            isMicMuted={topParticipant.isMicMuted}
            isVideoMuted={topParticipant.isVideoMuted}
            videoStream={topParticipant.videoStream}
            onClick={handleParticipantClick}
          />
        </div>

        <div className="grid grid-cols-2 auto-rows-fr flex-[3]">
          {bottomParticipants.map((participant) => (
            <VideoTile
              key={participant.id}
              id={participant.id}
              name={participant.name}
              isOnline={participant.isOnline}
              isMicMuted={participant.isMicMuted}
              isVideoMuted={participant.isVideoMuted}
              videoStream={participant.videoStream}
              onClick={handleParticipantClick}
            />
          ))}
        </div>
      </div>
    );
  }

  // 짝수명: 2열 grid
  return (
    <div className="grid grid-cols-2 auto-rows-fr h-full">
      {participants.map((participant) => (
        <VideoTile
          key={participant.id}
          id={participant.id}
          name={participant.name}
          isOnline={participant.isOnline}
          isMicMuted={participant.isMicMuted}
          isVideoMuted={participant.isVideoMuted}
          videoStream={participant.videoStream}
          onClick={handleParticipantClick}
        />
      ))}
    </div>
  );
};

export default VideoGrid;
