FROM node:16.19-alpine3.16 AS builder

WORKDIR /Mmon

COPY package*.json ./

RUN npm install --production

FROM node:16.19-alpine3.16

ENV MMON_DIR=/Mmon

WORKDIR ${MMON_DIR}

COPY --from=builder ${MMON_DIR}/node_modules ./node_modules

COPY . ${MMON_DIR}

RUN npm install -g pm2

EXPOSE 5880

#CMD pm2-runtime start index.js --name "serverMmon"
ENTRYPOINT ["sh", "docker-entrypoint.sh"]
