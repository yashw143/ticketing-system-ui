# ===== Stage 1: Build the Angular app =====
FROM node:20-alpine AS build
WORKDIR /app

# Copy package files first (for Docker layer caching)
COPY package*.json ./
RUN npm install

# Copy the rest of the source and build
COPY . .
RUN npm run build -- --configuration production

# ===== Stage 2: Serve with nginx =====
FROM nginx:alpine

# Remove nginx default files
RUN rm -rf /usr/share/nginx/html/*

# Copy built Angular files from the build stage
COPY --from=build /app/dist/TicketingSytem/browser /usr/share/nginx/html

# Copy our custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
