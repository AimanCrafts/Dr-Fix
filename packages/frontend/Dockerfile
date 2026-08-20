# Build stage
FROM node:20-alpine AS builder
<<<<<<< HEAD:client/Dockerfile

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
=======
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
>>>>>>> origin/develop:packages/frontend/Dockerfile
RUN npm run build

# Production stage
FROM node:20-alpine AS runner
<<<<<<< HEAD:client/Dockerfile

WORKDIR /app

# Copy built assets from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules

# Install serve to run the built app
RUN npm install -g serve

EXPOSE 5173

# Serve the built app
=======
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
RUN npm install -g serve
EXPOSE 5173
>>>>>>> origin/develop:packages/frontend/Dockerfile
CMD ["serve", "-s", "dist", "-l", "5173"]
