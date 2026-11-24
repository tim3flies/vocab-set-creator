# Shared body for english.learn8.co (http + https)
root /srv/english/public;
index index.html;
access_log /srv/english/logs/nginx.access.log main;
error_log  /srv/english/logs/nginx.error.log;
client_max_body_size 40m;
location ^~ /api/ {
    include fastcgi_params;
    fastcgi_param SCRIPT_FILENAME /srv/english/public/api/index.php;
    fastcgi_param HTTP_AUTHORIZATION $http_authorization;
    fastcgi_read_timeout 120s;
    fastcgi_pass unix:/srv/english/php.sock;
}
location ^~ /media/ {
    add_header Access-Control-Allow-Origin * always;
    add_header Cache-Control "public, max-age=31536000, immutable";
    location ~ \.(png|jpg|webp|gif)$ { try_files $uri =404; }
    return 404;
}
location ~ /\. { deny all; }
location ~ \.php$ { return 404; }
location / { add_header Cache-Control "no-cache"; try_files $uri $uri/ =404; }
