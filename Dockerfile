FROM node:14.21.3
RUN mkdir -p /usr/src/bot
WORKDIR /usr/src/bot
COPY . /usr/src/bot
RUN npm install
CMD ["npm", "start"]