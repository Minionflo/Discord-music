FROM node:14.18.3
RUN mkdir -p /usr/src/bot
WORKDIR /usr/src/bot
COPY . /usr/src/bot
RUN npm install
CMD ["npm", "start"]