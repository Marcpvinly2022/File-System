# We use Node 20 on Alpine Linux because it's tiny and secure
FROM node:20-alpine

# This is where your code will live inside the "mini-VM"
WORKDIR /usr/src/app

# Copy package files first to take advantage of Docker's caching
COPY package*.json ./

# Run the install inside the container environment
RUN npm install

# Now copy the rest of your code (src, utils, server.js, etc.)
COPY . .

# Your server.js uses port 6000
EXPOSE 6000

# This is the default command, but we will override it for the worker
CMD ["node", "server.js"]
