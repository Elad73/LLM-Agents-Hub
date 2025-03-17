FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json package-lock.json ./

# Install dependencies with legacy peer deps
RUN npm install --legacy-peer-deps

# Copy the rest of the application
COPY . .

# Set the Node.js memory limit
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Expose port 3000
EXPOSE 3000

# Start the application
CMD ["npm", "start"] 