#!/bin/bash

set -ex

echo 'Waiting for backend server to be available...'
until curl --silent --output /dev/null --fail --location http://server:3031/api/v1/heartbeat
do
  sleep 1
done
echo 'backend server is available'

echo 'Waiting for ui server to be available...'
until curl --silent --output /dev/null --fail --location http://ui:3030
do
  sleep 1
done
echo 'ui server is available'

service nginx start || (tail -n 5 /var/log/nginx/error.log && exit 1) # Restart container if nginx failed to start (wait for all upstreams to become available)
tail -n0 -F /var/log/nginx/*.log