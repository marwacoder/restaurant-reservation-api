# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build NestJS
RUN npm run build

# Stage 2: Production image
FROM node:20-alpine AS prod

WORKDIR /app

# Copy package.json and install production dependencies
COPY package*.json ./
RUN npm install --production

# Copy built code and prisma folder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Expose port
EXPOSE 5000

# Run Prisma migrate and start NestJS
CMD sh -c "npx prisma migrate deploy && node dist/main.js"
