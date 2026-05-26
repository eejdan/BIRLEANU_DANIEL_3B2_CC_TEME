FROM node:22-alpine

WORKDIR /app

COPY FFLOW.BACKEND.CALENDAR/package*.json ./
RUN npm ci --omit=dev

COPY shared /shared
COPY FFLOW.BACKEND.CALENDAR .

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "index.js"]
