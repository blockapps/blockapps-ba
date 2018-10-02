#FROM node:carbon-slim
#
#RUN apt-get update && \
#    apt-get install -y git && \
#    apt-get clean && \
#    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* && \
#    mkdir -p /usr/src/app
#
#WORKDIR /usr/src/app
#
#COPY package.json /usr/src/app
#
#RUN npm install
#
#COPY . /usr/src/app
#
#EXPOSE 3031
#
#CMD ["sh", "/usr/src/app/docker-run.sh"]

FROM node:carbon-slim

RUN apt-get update && \
    apt-get install -y git && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Copied from: http://bitjudo.com/blog/2014/03/13/building-efficient-dockerfiles-node-dot-js/
# use changes to package.json to force Docker not to use the cache
# when we change our application's nodejs dependencies:
ADD package.json /tmp/package.json

RUN cd /tmp && \
    npm install && \
    mkdir -p /usr/src/app && \
    cp -a /tmp/node_modules /usr/src/app/

WORKDIR /usr/src/app

ADD package.json ./package.json
ADD docker-run.sh ./docker-run.sh

EXPOSE 3031

CMD ["sh", "/usr/src/app/docker-run.sh"]