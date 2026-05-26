FROM node:22-alpine

WORKDIR /app

COPY FFLOW.BACKEND.AUTH/package*.json ./
RUN npm ci --omit=dev

COPY shared /shared
COPY FFLOW.BACKEND.AUTH .

ENV NODE_ENV=production
EXPOSE 3001

CMD ["node", "index.js"]
