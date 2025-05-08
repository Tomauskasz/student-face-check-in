# Stage 1: Build the React app
FROM node:18-alpine AS build-stage

WORKDIR /app

# Copy package.json and lock file
# Assumes package-lock.json is present, if not, adjust if only package.json is used
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Serve the static files with Nginx
FROM nginx:stable-alpine
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Optional: Copy a custom Nginx configuration if needed for routing, etc.
# Example: COPY nginx.conf /etc/nginx/conf.d/default.conf
# If you have client-side routing, you might need a nginx.conf like:
# server {
#   listen 80;
#   server_name localhost;
# 
#   location / {
#     root /usr/share/nginx/html;
#     index index.html index.htm;
#     try_files $uri $uri/ /index.html; # Important for SPAs
#   }
# }

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]