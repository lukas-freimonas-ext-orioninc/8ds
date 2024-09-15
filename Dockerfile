FROM node:18.17.1

WORKDIR /build

COPY package*.json ./

RUN npm ci --omit=dev && npm cache clean --force

COPY . .

EXPOSE 5000

CMD ["node", "server.js"]