-- 테스트용 데이터 삽입 SQL
-- When2meet 스타일 일정 조율 시스템

-- 1. Room 데이터
INSERT IGNORE INTO `room` (`room_id`, `room_title`, `room_state`, `invite_code`, `start_date`, `end_date`) VALUES
(1, '프로젝트 회의', 'ACTIVE', 12345, '2025-01-15', '2025-01-20'),
(2, '팀 빌딩', 'ACTIVE', 67890, '2025-01-25', '2025-01-30'),
(3, '기획 미팅', 'ACTIVE', 11111, '2025-02-01', '2025-02-05');

-- 2. User 데이터
INSERT IGNORE INTO `users` (`user_id`, `username`, `email`, `password`) VALUES
(1, 'user1', 'user1@example.com', 'password1'),
(2, 'user2', 'user2@example.com', 'password2'),
(3, 'user3', 'user3@example.com', 'password3'),
(4, 'user4', 'user4@example.com', 'password4'),
(5, 'user5', 'user5@example.com', 'password5');

-- 3. RoomUser 데이터 (룸 1에 5명 참여)
INSERT IGNORE INTO `room_user` (`room_user_id`, `room_id`, `user_id`, `profile_image`, `nickname`, `is_agreed`, `sort_order`) VALUES
(1, 1, 1, 'https://example.com/profile1.jpg', '푸른호랑이32', TRUE, 1),
(2, 1, 2, 'https://example.com/profile2.jpg', '조용한고래78', TRUE, 2),
(3, 1, 3, 'https://example.com/profile3.jpg', '빠른토끼15', TRUE, 3),
(4, 1, 4, 'https://example.com/profile4.jpg', '현명한올빼미99', TRUE, 4),
(5, 1, 5, 'https://example.com/profile5.jpg', '용감한사자44', TRUE, 5);

-- 4. RoomUser 데이터 (룸 2에 3명 참여)
INSERT IGNORE INTO `room_user` (`room_user_id`, `room_id`, `user_id`, `profile_image`, `nickname`, `is_agreed`, `sort_order`) VALUES
(6, 2, 1, 'https://example.com/profile1.jpg', '푸른호랑이32', TRUE, 1),
(7, 2, 2, 'https://example.com/profile2.jpg', '조용한고래78', TRUE, 2),
(8, 2, 3, 'https://example.com/profile3.jpg', '빠른토끼15', TRUE, 3);

-- 5. Availability 데이터 (룸 1의 일정)
-- 사용자 1의 일정
INSERT IGNORE INTO `availability` (`availability_id`, `room_user_id`, `timedata`, `date`) VALUES
(1, 1, '111100001111000011110000111100', '2025-01-15'),
(2, 1, '000011110000111100001111000011', '2025-01-16'),
(3, 1, '111111111111111111111111111111', '2025-01-17'),
(4, 1, '000000000000000000000000000000', '2025-01-18'),
(5, 1, '101010101010101010101010101010', '2025-01-19');

-- 사용자 2의 일정
INSERT IGNORE INTO `availability` (`availability_id`, `room_user_id`, `timedata`, `date`) VALUES
(6, 2, '000011110000111100001111000011', '2025-01-15'),
(7, 2, '111100001111000011110000111100', '2025-01-16'),
(8, 2, '111111111111111111111111111111', '2025-01-17'),
(9, 2, '101010101010101010101010101010', '2025-01-18'),
(10, 2, '000000000000000000000000000000', '2025-01-19');

-- 사용자 3의 일정
INSERT IGNORE INTO `availability` (`availability_id`, `room_user_id`, `timedata`, `date`) VALUES
(11, 3, '111111111111111111111111111111', '2025-01-15'),
(12, 3, '111111111111111111111111111111', '2025-01-16'),
(13, 3, '000000000000000000000000000000', '2025-01-17'),
(14, 3, '101010101010101010101010101010', '2025-01-18'),
(15, 3, '111100001111000011110000111100', '2025-01-19');

-- 사용자 4의 일정
INSERT IGNORE INTO `availability` (`availability_id`, `room_user_id`, `timedata`, `date`) VALUES
(16, 4, '000000000000000000000000000000', '2025-01-15'),
(17, 4, '101010101010101010101010101010', '2025-01-16'),
(18, 4, '111100001111000011110000111100', '2025-01-17'),
(19, 4, '000011110000111100001111000011', '2025-01-18'),
(20, 4, '111111111111111111111111111111', '2025-01-19');

-- 사용자 5의 일정
INSERT IGNORE INTO `availability` (`availability_id`, `room_user_id`, `timedata`, `date`) VALUES
(21, 5, '101010101010101010101010101010', '2025-01-15'),
(22, 5, '000000000000000000000000000000', '2025-01-16'),
(23, 5, '111100001111000011110000111100', '2025-01-17'),
(24, 5, '111111111111111111111111111111', '2025-01-18'),
(25, 5, '000011110000111100001111000011', '2025-01-19');

-- 6. Availability 데이터 (룸 2의 일정)
-- 사용자 6의 일정 (룸 2)
INSERT IGNORE INTO `availability` (`availability_id`, `room_user_id`, `timedata`, `date`) VALUES
(26, 6, '111100001111000011110000111100', '2025-01-25'),
(27, 6, '000011110000111100001111000011', '2025-01-26');

-- 사용자 7의 일정 (룸 2)
INSERT IGNORE INTO `availability` (`availability_id`, `room_user_id`, `timedata`, `date`) VALUES
(28, 7, '000011110000111100001111000011', '2025-01-25'),
(29, 7, '111100001111000011110000111100', '2025-01-26');

-- 사용자 8의 일정 (룸 2)
INSERT IGNORE INTO `availability` (`availability_id`, `room_user_id`, `timedata`, `date`) VALUES
(30, 8, '111111111111111111111111111111', '2025-01-25'),
(31, 8, '101010101010101010101010101010', '2025-01-26');


-- 7. User 데이터
INSERT INTO `users` (`user_id`, `join_date`)
VALUES (4329503012, '2024-01-01');

INSERT INTO `users` (`user_id`, `join_date`)
VALUES (4363130473, '2024-02-20');

INSERT INTO `users` (`user_id`, `join_date`)
VALUES (5940393020, '2024-03-02');

INSERT INTO `users` (`user_id`, `join_date`)
VALUES (3849283948, '2024-04-21');

INSERT INTO `users` (`user_id`, `join_date`)
VALUES (2039485933, '2024-05-01');

INSERT INTO `users` (`user_id`, `join_date`)
VALUES (2039483920, '2024-06-30');

INSERT INTO `users` (`user_id`, `join_date`)
VALUES (8493829394, '2024-07-02');

INSERT INTO `users` (`user_id`, `join_date`)
VALUES (9347391934, '2024-08-21');