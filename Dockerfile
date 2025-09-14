# Use the latest Node 22 LTS Alpine image
FROM node:22.17.1-alpine

# Set working directory
WORKDIR /app

# Copy package files first (for Docker layer caching)
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the source code
COPY . .

# Build the app (babel transpile)
RUN npm run build && npm run copy

# Expose Cloud Run port
EXPOSE 8080

# Start the transpiled app
CMD ["node", "dist/src/server.js"]
