FROM jenkins/jenkins:lts-jdk17

USER root

# 필수 패키지 설치
RUN apt-get update && \
    apt-get install -y git curl sudo docker.io && \
    rm -rf /var/lib/apt/lists/*

# Docker Compose v2 plugin 설치
RUN mkdir -p /usr/local/lib/docker/cli-plugins && \
    curl -SL https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64 \
    -o /usr/local/lib/docker/cli-plugins/docker-compose && \
    chmod +x /usr/local/lib/docker/cli-plugins/docker-compose && \
    ln -s /usr/local/lib/docker/cli-plugins/docker-compose /usr/local/bin/docker-compose

# Jenkins가 docker 사용 가능하도록 그룹 추가
RUN usermod -aG docker jenkins

USER jenkins
