# Stage 1: Build and install dependencies
FROM node:22-slim AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Run migrations (adjust the command as needed)
RUN npm run migrate

# Build the app (adjust the command as needed)
RUN npm run build

# Stage 2: Production image
FROM node:22-slim

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Remove devDependencies
RUN npm prune --production

CMD ["node", "dist/index.js"]
