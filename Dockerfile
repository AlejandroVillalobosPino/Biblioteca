FROM node:22-alpine
WORKDIR /app

COPY package*.json ./
# Copiamos prisma ANTES de instalar para poder generar el cliente
COPY prisma ./prisma/

RUN npm ci --only=production
RUN npx prisma generate

COPY . .

EXPOSE 3000
CMD ["node", "app.js"]