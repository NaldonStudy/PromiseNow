#!/bin/bash

# Redis 성능 테스트 스크립트
# 사용법: ./redis-performance-test.sh [MONITORING_SERVER_URL]

MONITORING_SERVER_URL=${1:-"http://localhost:8085"}
LOG_FILE="redis-performance-test-$(date +%Y%m%d-%H%M%S).log"

echo "🚀 Redis 성능 테스트 시작" | tee -a "$LOG_FILE"
echo "모니터링 서버 URL: $MONITORING_SERVER_URL" | tee -a "$LOG_FILE"
echo "로그 파일: $LOG_FILE" | tee -a "$LOG_FILE"
echo "==================================" | tee -a "$LOG_FILE"

# 1. 현재 성능 지표 조회
echo "📊 현재 Redis 성능 지표 조회..." | tee -a "$LOG_FILE"
curl -s "$MONITORING_SERVER_URL/api/monitoring/redis/performance" | jq '.' | tee -a "$LOG_FILE"

echo "" | tee -a "$LOG_FILE"

# 2. 부하 테스트 시나리오들
test_scenarios=(
    "10:50:30"   # 10명, 50작업, 30초
    "20:100:60"  # 20명, 100작업, 60초
    "50:200:120" # 50명, 200작업, 120초
    "100:500:180" # 100명, 500작업, 180초
)

for scenario in "${test_scenarios[@]}"; do
    IFS=':' read -r users ops duration <<< "$scenario"
    
    echo "🔥 부하 테스트 시나리오: $users명 동시 사용자, $ops작업/사용자, ${duration}초" | tee -a "$LOG_FILE"
    echo "시작 시간: $(date)" | tee -a "$LOG_FILE"
    
    # 부하 테스트 실행
    response=$(curl -s -X POST "$MONITORING_SERVER_URL/api/monitoring/redis/load-test?concurrentUsers=$users&operationsPerUser=$ops&durationSeconds=$duration")
    
    echo "완료 시간: $(date)" | tee -a "$LOG_FILE"
    echo "테스트 결과:" | tee -a "$LOG_FILE"
    echo "$response" | jq '.' | tee -a "$LOG_FILE"
    
    echo "" | tee -a "$LOG_FILE"
    echo "==================================" | tee -a "$LOG_FILE"
    
    # 테스트 간 간격
    sleep 10
done

# 3. 최종 성능 지표 조회
echo "📊 최종 Redis 성능 지표 조회..." | tee -a "$LOG_FILE"
curl -s "$MONITORING_SERVER_URL/api/monitoring/redis/performance" | jq '.' | tee -a "$LOG_FILE"

echo "" | tee -a "$LOG_FILE"
echo "✅ Redis 성능 테스트 완료" | tee -a "$LOG_FILE"
echo "결과는 $LOG_FILE 파일에서 확인하세요." | tee -a "$LOG_FILE"
