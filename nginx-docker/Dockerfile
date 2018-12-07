FROM nginx:alpine

EXPOSE 80

CMD [ "sh", "/docker-run.sh" ]

RUN mkdir -p /usr/src/configs

COPY docker-run.sh /
COPY *.conf /etc/nginx/
