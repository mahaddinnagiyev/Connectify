# Set version for production environment
FROM node:22-alpine

# Set app directory
WORKDIR /usr/src/app

# Copy app dependencies
COPY package*.json ./

# Install only production dependencies
RUN npm install --only=production

# Copy app source
COPY . .

# Build app
RUN npm run build

# Remove source codes
RUN rm -rf ./src

# Expose port
EXPOSE 3636

# Run app in production mode
CMD ["npm", "run", "start:prod"]