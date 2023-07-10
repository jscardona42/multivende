FROM node:16


WORKDIR /app/merchant

COPY ./package*.json ./
COPY prisma ./prisma/
RUN npm install
COPY . .

RUN npm run build

ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.9.0/wait /wait

RUN chmod +x /wait

EXPOSE 3000

CMD /wait && sh run.sh
