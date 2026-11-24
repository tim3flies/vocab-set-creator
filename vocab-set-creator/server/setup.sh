#!/bin/bash
# One-time setup of english.learn8.co on the ServerPilot droplet. Run as root from the unpacked repo: bash server/setup.sh
# Touches only: /srv/english, /etc/nginx-sp/vhosts.d/english.conf, /etc/nginx-sp/english-body.inc, /etc/php8.3-sp/fpm-pools.d/english.conf
set -euo pipefail
D=$(cd "$(dirname "$0")" && pwd); R=/srv/english
mkdir -p $R/public/media $R/data $R/logs
chown -R serverpilot:serverpilot $R; chmod 750 $R/data
if [ ! -f $R/data/config.php ]; then
  INV=$(od -An -N5 -tx1 /dev/urandom | tr -d ' \n')
  printf "<?php return ['invite'=>'%s','base'=>'https://english.learn8.co'];\n" "$INV" > $R/data/config.php
  chown serverpilot:serverpilot $R/data/config.php; chmod 640 $R/data/config.php
fi
install -m 644 $D/php-pool.conf /etc/php8.3-sp/fpm-pools.d/english.conf
/opt/sp/php8.3/sbin/php-fpm --fpm-config /etc/php8.3-sp/fpm.conf --test
systemctl restart php8.3-fpm-sp
install -m 644 $D/nginx-body.inc /etc/nginx-sp/english-body.inc
MODE=HTTP; [ -f /etc/letsencrypt/live/english.learn8.co/fullchain.pem ] && MODE=SSL
sed "s/#$MODE# //" $D/nginx.conf | grep -v '^ *#\(HTTP\|SSL\)#' > /etc/nginx-sp/vhosts.d/english.conf
/opt/sp/nginx/sbin/nginx -t -c /etc/nginx-sp/nginx.conf
systemctl reload nginx-sp
echo "SETUP OK ($MODE)"
