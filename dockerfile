FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache python3 py3-pip \
    && ln -s /usr/bin/python3 /usr/bin/python

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["node", "index.js"]