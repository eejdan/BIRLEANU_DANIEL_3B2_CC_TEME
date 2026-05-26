FROM node:22-alpine

WORKDIR /app

COPY FFLOW.BACKEND.BILLING/package*.json ./
RUN npm ci --omit=dev

COPY shared /shared
COPY FFLOW.BACKEND.BILLING .

ENV NODE_ENV=production
EXPOSE 3003

CMD ["node", "index.js"]
