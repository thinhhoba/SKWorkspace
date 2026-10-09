#!/usr/bin/env bash
set -e

# setup-vps.sh — Chuan bi VPS Ubuntu cho SK Workspace
# Chay voi quyen root hoac sudo:  sudo bash scripts/setup-vps.sh

if [ "$(id -u)" -ne 0 ]; then
  echo "Vui long chay voi sudo: sudo bash $0"
  exit 1
fi

echo "==> Cai dat Docker va Docker Compose plugin..."

apt-get update
apt-get install -y ca-certificates curl gnupg

install -m 0755 -d /etc/apt/keyrings
if [ ! -f /etc/apt/keyrings/docker.gpg ]; then
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  chmod a+r /etc/apt/keyrings/docker.gpg
fi

if [ ! -f /etc/apt/sources.list.d/docker.list ]; then
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" > /etc/apt/sources.list.d/docker.list
fi

apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

systemctl enable --now docker

echo "==> Tao thu muc /opt/sk-workspace..."
mkdir -p /opt/sk-workspace

echo "==> Cau hinh UFW..."
apt-get install -y ufw
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

echo "==> Hoan tat!"
echo "    Docker:  $(docker --version)"
echo "    Compose: $(docker compose version)"
echo "    UFW:     $(ufw status | head -n 20)"
echo "    Thu muc: /opt/sk-workspace"
