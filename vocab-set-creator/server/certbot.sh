#!/bin/bash
# HTTPS for english.learn8.co with Let's Encrypt (webroot; nginx-sp is not edited by certbot). Run as root once.
set -euo pipefail
command -v certbot >/dev/null || apt-get install -y certbot
certbot certonly --webroot -w /srv/english/public -d english.learn8.co --agree-tos --register-unsafely-without-email -n
mkdir -p /etc/letsencrypt/renewal-hooks/deploy
printf '#!/bin/sh\nsystemctl reload nginx-sp\n' > /etc/letsencrypt/renewal-hooks/deploy/nginx-sp.sh
chmod 755 /etc/letsencrypt/renewal-hooks/deploy/nginx-sp.sh
echo "CERT OK"
