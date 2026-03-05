FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache python3 py3-pip \
    && ln -sf python3 /usr/bin/python

COPY package*.json ./

RUN npm ci --omit=dev

COPY . .

EXPOSE 3000

CMD ["node", "index.js"]