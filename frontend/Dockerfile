FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with legacy peer deps
RUN npm install --legacy-peer-deps

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

# Set the Node.js memory limit
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Expose port 3000
EXPOSE 3000

# Start the application with development server
CMD ["npm", "start"] 