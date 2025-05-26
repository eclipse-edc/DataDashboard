# Stage 1: Build the Angular application
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy the full project and build it
COPY . .
RUN npm run lib-build -- --configuration production && npm run build -- --configuration production


# Stage 2: Serve the app with Nginx
FROM nginxinc/nginx-unprivileged:1.27.4-alpine3.21-slim

COPY --from=builder /app/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist/data-dashboard/browser /app

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
