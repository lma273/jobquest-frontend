# Stage 1: Build React/Vite app
FROM node:20-alpine AS build
WORKDIR /app

# Copy package files & install deps
COPY package*.json ./
RUN npm install

# Cho phép truyền biến môi trường khi build
#Đổi tên biến
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

# Copy code vào container
COPY . .

# Build production
RUN npm run build

# Stage 2: Serve bằng Nginx
FROM nginx:alpine

# Copy build từ Vite (thư mục 'dist')
COPY --from=build /app/dist /usr/share/nginx/html

# Expose cổng 80
EXPOSE 80

# Run nginx
CMD ["nginx", "-g", "daemon off;"]
