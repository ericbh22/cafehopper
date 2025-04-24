# Use Node LTS base image
FROM node:18

# Set working directory
WORKDIR /app

# Copy everything
COPY . .

# Install Expo CLI globally and project deps
RUN npm install -g expo-cli && npm install

# Expose Expo ports
EXPOSE 8081 19000 19001 19002

# Start Expo dev server
CMD ["npx", "expo", "start", "--tunnel"]
