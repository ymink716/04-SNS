FROM node:16-alpine3.11

WORKDIR /sns-app/
RUN apk update
RUN apk upgrade
RUN apk --no-cache add tzdata && \
        cp /usr/share/zoneinfo/Asia/Seoul /etc/localtime && \
        echo "Asia/Seoul" > /etc/timezone
COPY ./package.json /sns-app/
COPY ./yarn.lock /sns-app/
RUN yarn install
COPY . /sns-app/
CMD yarn start:dev