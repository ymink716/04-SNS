FROM node:16

WORKDIR /wanted-sns/
COPY ./package.json /wanted-sns/
COPY ./yarn.lock /wanted-sns/
RUN yarn install
COPY . /wanted-sns/
CMD yarn start:dev