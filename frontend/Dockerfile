#dockerfile for react frontend
#containerizes node.js env

FROM node:20-alpine

#set working directory
WORKDIR /app

#copy package files
COPY package*.json ./

#install dependencies
RUN npm install

#copy rest of app

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "3000"]
