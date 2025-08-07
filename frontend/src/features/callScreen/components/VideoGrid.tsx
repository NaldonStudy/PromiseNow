import VideoTile from './VideoTile';

interface Participant {
  id: string;
  name: string;
  isOnline: boolean;
  isMuted: boolean;
  videoStream: MediaStream | null;
}

interface Props {
  participants?: Participant[];
}

const VideoGrid = ({ participants = [] }: Props) => {
  const participantCount = participants.length;

  // 홀수명: 상단 1명 + 하단 2열 grid
  if (participantCount % 2 !== 0) {
    const topParticipant = participants[0];
    const bottomParticipants = participants.slice(1);

    return (
      <div className="flex flex-col h-full">
        <div className="flex-1">
          <VideoTile
            key={topParticipant.id}
            name={topParticipant.name}
            isOnline={topParticipant.isOnline}
            isMuted={topParticipant.isMuted}
            videoStream={topParticipant.videoStream}
          />
        </div>

        <div className="grid grid-cols-2 auto-rows-fr flex-[3]">
          {bottomParticipants.map((participant) => (
            <VideoTile
              key={participant.id}
              name={participant.name}
              isOnline={participant.isOnline}
              isMuted={participant.isMuted}
              videoStream={participant.videoStream}
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
          name={participant.name}
          isOnline={participant.isOnline}
          isMuted={participant.isMuted}
          videoStream={participant.videoStream}
        />
      ))}
    </div>
  );
};

export default VideoGrid;
