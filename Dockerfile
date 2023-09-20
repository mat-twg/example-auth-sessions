FROM node:19-alpine
WORKDIR /home/node/app
COPY . .
RUN yarn install
CMD ["/bin/sh"]
