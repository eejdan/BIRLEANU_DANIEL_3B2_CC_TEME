FROM node:22-alpine

WORKDIR /app

COPY FFLOW.BACKEND.RECOMMENDATIONS/package*.json ./
RUN npm ci --omit=dev

COPY shared /shared
COPY FFLOW.BACKEND.RECOMMENDATIONS .

ENV NODE_ENV=production
EXPOSE 3002

CMD ["node", "index.js"]
