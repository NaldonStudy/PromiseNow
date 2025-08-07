package com.promisenow.api.domain.room.scheduler;

import com.promisenow.api.domain.room.service.RoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class RoomScheduler {

    private final RoomService roomService;

    @Scheduled(cron = "0 */1 * * * *")
    public void runRoomActivation() {
        roomService.checkAndActivateRooms();
    }

}
