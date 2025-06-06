FROM node:18

WORKDIR /app

# Copy package.json and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of the frontend
COPY . .

# Expose the Vite development server port
EXPOSE 5173

# # Run the Vite development server
# CMD ["npm", "run", "dev"]
