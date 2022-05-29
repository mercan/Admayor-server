FROM node:16.3.0

WORKDIR /usr/app

COPY package*.json ./

# install dependencies
RUN npm install

COPY . .

CMD [ "npm", "start" ]