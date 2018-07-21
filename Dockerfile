FROM node:10
WORKDIR /app
COPY . /app
RUN npm i
CMD node app.js
EXPOSE 3005:3000