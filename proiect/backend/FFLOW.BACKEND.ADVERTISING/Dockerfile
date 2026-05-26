FROM node:22-alpine

WORKDIR /app

COPY FFLOW.BACKEND.ADVERTISING/package*.json ./
RUN npm ci --omit=dev

COPY shared /shared
COPY FFLOW.BACKEND.ADVERTISING .

ENV NODE_ENV=production
EXPOSE 3004

CMD ["node", "index.js"]
