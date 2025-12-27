# set up instruction for single docker container

# Use an official node.js runtime as a parent image
FROM node:22-alpine

# set the working directory in the container
WORKDIR /app

# install openssl 
RUN apk add --no-cache openssl

# copy the package.json and package-lock.json files to the container
COPY package*.json .

# Install the dependencies
RUN npm install 

# copy the rest of the application code
COPY . .

# Expose the port that the app runs on
EXPOSE 5003

# define the command to run your application
CMD ["node", "./src/server.js"]