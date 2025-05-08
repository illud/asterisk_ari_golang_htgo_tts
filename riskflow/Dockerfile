# Use an official Node.js image as base
FROM node:20-alpine

# Set working directory
WORKDIR /frontend

# Install dependencies
COPY package.json package-lock.json* ./  
RUN npm install

# Copy the rest of the project
COPY . .

# Expose the Vite default dev port
EXPOSE 5173

# Run Vite development server
CMD ["npm", "run", "dev"]
