package com.promisenow.api.domain.availability.repository;

import com.promisenow.api.domain.availability.dto.AvailabilityResponseDto;
import com.promisenow.api.domain.availability.entity.QAvailability;
import com.promisenow.api.domain.room.entity.QRoom;
import com.promisenow.api.domain.room.entity.QRoomUser;
import com.querydsl.core.types.Projections;
import com.querydsl.core.types.dsl.Expressions;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
@RequiredArgsConstructor
public class AvailabilityRepositoryImpl implements AvailabilityRepositoryCustom {
    
    private final JPAQueryFactory queryFactory;
    
    @Override
    public List<AvailabilityResponseDto.ConfirmedUsersResponse.UserInfo> findConfirmedUsersBySlot(Long roomId, LocalDate date, int slot) {
        QAvailability availability = QAvailability.availability;
        QRoomUser roomUser = QRoomUser.roomUser;
        QRoom room = QRoom.room;
        
        return queryFactory
                .select(Projections.constructor(
                        AvailabilityResponseDto.ConfirmedUsersResponse.UserInfo.class,
                        roomUser.nickname,
                        roomUser.profileImage
                ))
                .from(availability)
                .join(availability.roomUser, roomUser)
                .join(roomUser.room, room)
                .where(
                        room.roomId.eq(roomId),
                        availability.date.eq(date),
                        // DB에서 직접 특정 슬롯의 값이 '1'인지 확인
                        // substring은 1-based index이므로 slot + 1 사용
                        Expressions.stringTemplate("substring({0}, {1}, 1)", availability.timeData, slot + 1)
                                .eq("1")
                )
                .fetch();
    }

    @Override
    public List<AvailabilityResponseDto.ConfirmedUsersResponse.UserInfo> findConfirmedUsersByDate(Long roomId, LocalDate date) {
        QAvailability availability = QAvailability.availability;
        QRoomUser roomUser = QRoomUser.roomUser;
        QRoom room = QRoom.room;

        return queryFactory
                .select(Projections.constructor(
                        AvailabilityResponseDto.ConfirmedUsersResponse.UserInfo.class,
                        roomUser.nickname,
                        roomUser.profileImage
                ))
                .from(availability)
                .join(availability.roomUser, roomUser)
                .join(roomUser.room, room)
                .where(
                        room.roomId.eq(roomId),
                        availability.date.eq(date),
                        availability.timeData.contains("1")
                )
                .fetch();
    }
} 