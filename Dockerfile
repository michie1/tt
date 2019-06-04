FROM node:12.3.1
COPY . /src
WORKDIR /src/backend
RUN ls
RUN cat package.json | grep 'start'
RUN yarn install
CMD yarn run start
