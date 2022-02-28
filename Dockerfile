# Stage 1: Compile and Build angular codebase

# Use official node image as the base image
FROM node:lts as build

# Set the working directory
WORKDIR /app

# Add the source code to app
COPY ./ /app/

# Install all the dependencies
RUN npm install

# Generate the build of the application
RUN npm run build


EXPOSE 4200
CMD ["npm", "start"]
