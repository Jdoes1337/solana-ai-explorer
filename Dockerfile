# Production deployment
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy minimal package files
COPY package-minimal.json package.json

# Install minimal dependencies
RUN npm install --only=production && npm cache clean --force

# Copy source code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

# Expose port
EXPOSE 3001

# No health check for now

# Start the application
CMD ["node", "server-minimal.js"]
