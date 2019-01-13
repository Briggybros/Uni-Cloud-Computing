FROM node:latest

# Create server directory
RUN mkdir -p /usr/src/signalling
WORKDIR /usr/src/signalling

# Copy package.json and yarn.lock into directory
COPY ./package.json /usr/src/signalling/package.json

# Install packages from lockfile
RUN yarn install

# Copy code into directory
COPY . /usr/src/signalling

RUN yarn compile

# Expose the port 8080
EXPOSE 8081

# Set the startup command
CMD ["yarn", "start"]