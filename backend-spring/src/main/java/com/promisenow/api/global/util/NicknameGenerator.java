package com.promisenow.api.global.util;

import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Random;

@Component
public class NicknameGenerator {
    
    private static final List<String> ADJECTIVES = List.of(
        "즐거운", "신나는", "행복한", "멋진", "아름다운", "훌륭한", "똑똑한", "친절한",
        "용감한", "지혜로운", "창의적인", "열정적인", "긍정적인", "활발한", "차분한", "신중한",
        "유쾌한", "재미있는", "특별한", "완벽한", "독특한", "매력적인", "자유로운", "평화로운",
        "따뜻한", "시원한", "깔끔한", "정갈한", "화려한", "소박한", "고급스러운", "귀여운"
    );
    
    private static final List<String> NOUNS = List.of(
        "호랑이", "사자", "곰", "늑대", "여우", "토끼", "다람쥐", "고양이", "강아지", "펭귄",
        "코알라", "판다", "기린", "코끼리", "하마", "악어", "독수리", "부엉이", "까마귀", "참새",
        "나비", "벌", "개미", "거미", "달팽이", "지렁이", "물고기", "고래", "돌고래", "상어",
        "문어", "오징어", "게", "새우", "조개", "산호", "해초", "나무", "꽃", "풀", "이끼",
        "바위", "구름", "별", "달", "태양", "바람", "비", "눈", "안개", "무지개", "번개"
    );
    
    private final Random random = new Random();
    
    /**
     * 형용사 + 명사 형태의 랜덤 닉네임을 생성합니다.
     * @return 랜덤 닉네임
     */
    public String generateNickname() {
        String adjective = ADJECTIVES.get(random.nextInt(ADJECTIVES.size()));
        String noun = NOUNS.get(random.nextInt(NOUNS.size()));
        return adjective + noun;
    }
    
    /**
     * 숫자가 포함된 형용사 + 명사 형태의 랜덤 닉네임을 생성합니다.
     * @return 랜덤 닉네임 (예: 즐거운호랑이32)
     */
    public String generateNicknameWithNumber() {
        String baseNickname = generateNickname();
        int randomNumber = random.nextInt(100); // 0-99
        return baseNickname + randomNumber;
    }
    
    /**
     * 특정 길이 제한 내에서 랜덤 닉네임을 생성합니다.
     * @param maxLength 최대 길이
     * @return 랜덤 닉네임
     */
    public String generateNicknameWithLengthLimit(int maxLength) {
        String nickname = generateNicknameWithNumber();
        
        // 길이가 제한을 초과하면 명사만 사용
        if (nickname.length() > maxLength) {
            String noun = NOUNS.get(random.nextInt(NOUNS.size()));
            int number = random.nextInt(100);
            return noun + number;
        }
        
        return nickname;
    }
}
