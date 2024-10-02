# Use the official Node.js image
FROM node:20

# Create app directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json if available from the project root
COPY package*.json ./

# Install app dependencies
RUN npm install --production

# Copy the entire project directory contents to the app directory
COPY . .

# Define build argument
ARG NODE_ENV
# Set environment variable
ENV NODE_ENV=${NODE_ENV}

# Bind to the specified ports
EXPOSE 3000

# Command to run the app
CMD ["node", "api/server.js"]
