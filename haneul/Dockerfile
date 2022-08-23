FROM node:17.2.0-alpine

WORKDIR /sns-service
COPY ./package.json sns-service/
COPY ./yarn.lock /sns-service/
RUN yarn install
COPY . /sns-service/
CMD yarn start:dev