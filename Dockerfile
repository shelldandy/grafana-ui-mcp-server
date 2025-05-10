# Use Node.js as the base image
FROM node:20-slim

# Create app directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy app source
COPY . .

# Build TypeScript code
RUN npm run build

# Expose port for HTTP server (optional for stdio, but good practice if http might be added)
EXPOSE 3000

# Start the STDIO server
CMD ["npm", "run", "start"]