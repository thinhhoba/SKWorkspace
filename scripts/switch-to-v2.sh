#!/usr/bin/env bash
set -e
CONF="/etc/nginx/sites-available/workspace.sonkhang.vn"
echo "==> Sao luu $CONF -> $CONF.bak"
sudo cp "$CONF" "$CONF.bak"
echo "==> Doi proxy_pass 6060 -> 3000"
sudo sed -i 's|proxy_pass http://127.0.0.1:6060;|proxy_pass http://127.0.0.1:3000;|g' "$CONF"
echo "==> Kiem tra cu phap nginx -t"
sudo nginx -t
echo "==> Reload nginx"
sudo systemctl reload nginx
echo "CHUYEN TIEP THANH CONG SANG SK WORKSPACE 2 (PORT 3000)!"
