#FROM node:carbon-slim
#
#RUN mkdir -p  /usr/src/app && \
#    npm install -g serve
#
#WORKDIR /usr/src/app
#
#COPY . /usr/src/app
#
#RUN npm install && \
#    npm run build && \
#    rm -rf public src #node_modules_not_removed_to_keep_dev_depende
#
#EXPOSE 3030
#
#CMD ["sh", "/usr/src/app/docker-run.sh"]

FROM node:carbon-slim

RUN mkdir -p /usr/src/app

ADD docker-run.sh /usr/src/app/docker-run.sh

WORKDIR /usr/src/app/ui

EXPOSE 3031

CMD ["sh", "/usr/src/app/docker-run.sh"]


