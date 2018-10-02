FROM nginx:1.13
MAINTAINER BlockApps Inc.

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && \
    apt-get install -y apache2-utils curl && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists* /tmp/* /var/tmp/* && \
    mkdir -p /etc/nginx

COPY nginx.conf /etc/nginx/

COPY docker-run.sh /

RUN chmod a+x /docker-run.sh

ENTRYPOINT ["/docker-run.sh"]