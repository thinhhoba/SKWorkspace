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
mkdir -p /var/www/certbot

echo "==> Cau hinh UFW..."
apt-get install -y ufw
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# --- Certbot / Let's Encrypt ---
echo "==> Cai dat Certbot..."
apt-get install -y certbot

# Tao cron tu dong renew (chay 03:00 moi ngay, reload nginx sau khi renew)
CRON_LINE='0 3 * * * certbot renew --quiet --deploy-hook "docker compose -f /opt/sk-workspace/docker-compose.yml exec nginx nginx -s reload 2>/dev/null || systemctl reload nginx 2>/dev/null || true"'
if ! crontab -l 2>/dev/null | grep -q "certbot renew"; then
  (crontab -l 2>/dev/null; echo "$CRON_LINE") | crontab -
  echo "    Da them cron renew certbot (03:00 hang ngay)."
else
  echo "    Cron certbot renew da ton tai."
fi

echo ""
echo "==> Hoan tat!"
echo "    Docker:  $(docker --version)"
echo "    Compose: $(docker compose version)"
echo "    Certbot: $(certbot --version 2>/dev/null || echo 'installed')"
echo "    UFW:     $(ufw status | head -n 20)"
echo "    Thu muc: /opt/sk-workspace"
echo ""
echo "======================================================================"
echo "  HUONG DAN CAP CHUNG CHI SSL (chay sau khi DNS tro ve VPS)"
echo "======================================================================"
echo "  VPS IP: 103.124.93.145"
echo "  Cac domain can tro A record ve IP tren:"
echo "    - workspace.sonkhang.vn"
echo "    - pos.sonkhang.vn"
echo "    - dathang.sonkhang.vn"
echo ""
echo "  1) Kiem tra DNS da tro dung:"
echo "     dig +short workspace.sonkhang.vn   # phai ra 103.124.93.145"
echo "     dig +short pos.sonkhang.vn"
echo "     dig +short dathang.sonkhang.vn"
echo ""
echo "  2a) Cap chung chi bang certbot tren host (khuyen nghi):"
echo "     sudo certbot certonly --webroot -w /var/www/certbot \\"
echo "       -d workspace.sonkhang.vn -d pos.sonkhang.vn -d dathang.sonkhang.vn \\"
echo "       --email admin@sonkhang.vn --agree-tos --no-eff-email"
echo ""
echo "  2b) Hoac cap bang docker compose (neu dung service certbot):"
echo "     docker compose --profile certbot run --rm certbot certonly --webroot \\"
echo "       -w /var/www/certbot \\"
echo "       -d workspace.sonkhang.vn -d pos.sonkhang.vn -d dathang.sonkhang.vn \\"
echo "       --email admin@sonkhang.vn --agree-tos --no-eff-email"
echo ""
echo "  3) Sau khi cap, reload nginx:"
echo "     docker compose exec nginx nginx -s reload"
echo "     # hoac: sudo systemctl reload nginx  (neu chay nginx tren host)"
echo ""
echo "  4) Test renew kho (dry-run):"
echo "     sudo certbot renew --dry-run"
echo ""
echo "  5) Cron tu dong renew da duoc cai (03:00 hang ngay)."
echo "======================================================================"
