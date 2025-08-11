FROM node:22-alpine

WORKDIR /app

COPY package*.json .

RUN apk add --no-cache libc6-compat
RUN npm ci

# Copy schema separately so we can run generate before copying all source files
COPY prisma ./prisma
RUN npx prisma generate --schema=./prisma/schema.prisma

# Now copy the rest of the app
COPY . .

EXPOSE 5000
CMD ["node", "./src/server.js"]
