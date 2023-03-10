FROM node:latest

WORKDIR /app

COPY package.json package.json
COPY package-lock.json package-lock.json
COPY .sequelizerc .sequelizerc

RUN npm install

COPY . .
COPY database ./database

RUN npm run build

ENTRYPOINT [ "node", "/app/dist/app.js" ]
