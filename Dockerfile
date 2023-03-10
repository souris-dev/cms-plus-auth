FROM node:latest

WORKDIR /app

COPY package.json package.json
COPY package-lock.json package-lock.json
COPY .sequelizerc .sequelizerc

RUN npm install

COPY . .
COPY database ./database

RUN npm run build
COPY database ./dist/database

ENTRYPOINT [ "node", "/app/dist/src/app.js" ]
