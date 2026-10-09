#!/usr/bin/env bash
set -e
CONF="/etc/nginx/sites-available/workspace.sonkhang.vn"
BAK="$CONF.bak"
if [ ! -f "$BAK" ]; then echo "Khong tim thay $BAK — khong the rollback"; exit 1; fi
echo "==> Khoi phuc $BAK -> $CONF"
sudo cp "$BAK" "$CONF"
sudo nginx -t
sudo systemctl reload nginx
echo "ROLLBACK THANH CONG VE V1 (PORT 6060)!"
