FROM node:16-alpine3.11

WORKDIR /04-SNS/

RUN apk update
RUN apk upgrade
RUN apk --no-cache add tzdata && \
    cp /usr/share/zoneinfo/Asia/Seoul /etc/localtime && \
    echo "Asia/Seoul" > /etc/timezone

COPY ./package.json /04-SNS/
COPY ./package-lock.json /04-SNS/

RUN npm install

COPY . /04-SNS/

CMD npm run start:dev
