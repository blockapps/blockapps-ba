# !/usr/bin/env bash
set -e
set -x

if [ -z "$HOST_IP" ]; then
  echo "HOST_IP variable is not set. Please provide the external IP of the host for nginx to be able to reach app running on the host"
else
  if [ "$HOST_IP" = "localhost" ] || [ "$HOST_IP" = "127.0.0.1" ]; then
    echo "You can not use 'localhost' or '127.0.0.1' for HOST_IP - they are not accessible from within the docker container"
  fi
fi

ln -sf nginx-$(${ssl:-false} || echo "no")ssl.conf /etc/nginx/nginx.conf

if [ "$ssl" = true ] ; then
	cp /tmp/ssl/server.key /etc/ssl/
	cp /tmp/ssl/server.${sslCertFileType} /etc/ssl/
	sed -i 's/<SSL_CERT_FILE_TYPE>/'"$sslCertFileType"'/g' /etc/nginx/nginx.conf
fi

sed -i 's/<HOST_IP>/'"${HOST_IP}"'/g' /etc/nginx/nginx.conf

nginx
tail -n0 -F /var/log/nginx/*.log
